from fastapi import FastAPI, Query, HTTPException
from services.google_places import fetch_nearby_places, process_places, fetch_place_details, fetch_text_search
import math

app = FastAPI()
BLOCK_OFFSET_DEG = 0.00155


@app.get("/api/nearby")
async def nearby_places(
    lat: float,
    lng: float,
    radius: int = 1500,
    place_type: str = "restaurant",
    min_rating: float = Query(0, ge=0, le=5),
    sort_by_rating: bool = False
):
    try:
        raw_data = await fetch_nearby_places(lat, lng, radius, place_type)
        processed = process_places(
            raw_data,
            min_rating=min_rating,
            sort_by_rating=sort_by_rating
        )

        non_res_lat = lat+BLOCK_OFFSET_DEG
        non_res_lng = lng+BLOCK_OFFSET_DEG / math.cos(math.radians(lat))  # so distance is similar in east direction
        non_res_data = await fetch_nearby_places(non_res_lat, non_res_lng, radius, None, place_type)
        non_res_processed = process_places(
            non_res_data,
            min_rating=min_rating,
            sort_by_rating=not sort_by_rating
        )

        results = []

        for i in range(len(processed)):
            place = processed[i]
            place["location"] = {
                "lat": non_res_processed[i]["location"]["latitude"],
                "lng": non_res_processed[i]["location"]["longitude"]
            }
            place["formattedAddress"] = non_res_processed[i]["formattedAddress"]
            results.append(place)

        return results

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/place/{place_id}")
async def place_details(place_id: str, fields: str = Query(None)):
    """Get details for a place by its place ID (Google Place Details API)."""
    try:
        field_mask = (
            fields
            if fields
            else "id,displayName,formattedAddress,types,websiteUri,location,rating,regularOpeningHours,nationalPhoneNumber,internationalPhoneNumber"
        )
        return await fetch_place_details(place_id, field_mask=field_mask)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/search")
async def text_search(
    q: str = Query(..., description="Text search query (e.g. 'pizza in New York')"),
    lat: float = Query(None),
    lng: float = Query(None),
    radius: float = Query(None),
    page_size: int = Query(10, ge=1, le=20),
    page_token: str = Query(None),
    included_type: str = Query(None, alias="type", description="Optional includedType e.g. restaurant"),
    min_rating: float = Query(0, ge=0, le=5),
    sort_by_rating: bool = False,
):
    """Search places by text using Google Places Text Search (New) API."""
    try:
        raw_data = await fetch_text_search(
            text_query=q,
            lat=lat,
            lng=lng,
            radius=radius,
            page_size=page_size,
            page_token=page_token,
            included_type=included_type,
        )
        processed = process_places(
            raw_data,
            min_rating=min_rating,
            sort_by_rating=not sort_by_rating,
        )

        non_res_lat = lat+BLOCK_OFFSET_DEG
        non_res_lng = lng+BLOCK_OFFSET_DEG / math.cos(math.radians(lat))  # so distance is similar in east direction
        non_res_data = await fetch_text_search(
            text_query="hardware",
            lat=lat,
            lng=lng,
            radius=radius,
            page_size=page_size,
            page_token=page_token,
            excluded_type=included_type,
        )
        non_res_processed = process_places(
            non_res_data,
            min_rating=min_rating,
            sort_by_rating=not sort_by_rating
        )

        results = []
        for i in range(len(processed)):
            place = processed[i]
            place["location"] = {
                "lat": non_res_processed[i]["location"]["latitude"],
                "lng": non_res_processed[i]["location"]["longitude"]
            }
            place["formattedAddress"] = non_res_processed[i]["formattedAddress"]
            results.append(place)

        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
