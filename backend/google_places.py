import os
import httpx
from typing import List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_MAPS_KEY")
BASE_URL = "https://places.googleapis.com/v1/places:searchNearby"
PLACE_DETAILS_URL = "https://places.googleapis.com/v1/places"
TEXT_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText"


async def fetch_nearby_places(
    lat: float,
    lng: float,
    radius: float,
    place_type: str,
    exclue_place_type: str = None,
    max_result_count: int = 10
) -> Dict[str, Any]:
    body = {
        "includedTypes": [place_type],
        "excludedTypes": [exclue_place_type],
        "maxResultCount": max_result_count,
        "locationRestriction": {
            "circle": {
                "center": {
                    "latitude": lat,
                    "longitude": lng,
                },
                "radius": radius,
            }
        },
    }
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_API_KEY,
        "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.types,places.websiteUri,places.location,places.rating",
    }

    async with httpx.AsyncClient() as client:
        response = await client.post(BASE_URL, json=body, headers=headers)
        response.raise_for_status()
        return response.json()


async def fetch_place_details(
    place_id: str,
    field_mask: str = "id,displayName,formattedAddress,types,websiteUri,location,rating,regularOpeningHours,nationalPhoneNumber,internationalPhoneNumber",
) -> Dict[str, Any]:
    """
    Fetch details for a single place using the Place Details (New) API.
    See: https://developers.google.com/maps/documentation/places/web-service/place-details
    """
    # Accept either raw place ID or resource name (places/ChIJ...)
    if place_id.startswith("places/"):
        place_id = place_id.replace("places/", "", 1)
    url = f"{PLACE_DETAILS_URL}/{place_id}"
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_API_KEY,
        "X-Goog-FieldMask": field_mask,
    }
    async with httpx.AsyncClient() as client:
        response = await client.get(url, headers=headers)
        response.raise_for_status()
        return response.json()


async def fetch_text_search(
    text_query: str,
    lat: float = None,
    lng: float = None,
    radius: float = None,
    page_size: int = 10,
    page_token: str = None,
    included_type: str = None,
    excluded_type: str = None,
    field_mask: str = "places.id,places.displayName,places.formattedAddress,places.types,places.websiteUri,places.location,places.rating",
) -> Dict[str, Any]:
    """
    Search places by text using the Text Search (New) API.
    See: https://developers.google.com/maps/documentation/places/web-service/text-search
    """
    body = {"textQuery": text_query}
    if lat is not None and lng is not None:
        body["locationBias"] = {
            "circle": {
                "center": {"latitude": lat, "longitude": lng},
                "radius": radius if radius is not None else 0.0,
            }
        }
    if page_size is not None:
        body["pageSize"] = min(20, max(1, page_size))
    if page_token:
        body["pageToken"] = page_token
    if included_type:
        body["includedType"] = included_type
    if excluded_type:
        body["excludedType"] = excluded_type
    headers = {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": GOOGLE_API_KEY,
        "X-Goog-FieldMask": field_mask,
    }
    async with httpx.AsyncClient() as client:
        response = await client.post(TEXT_SEARCH_URL, json=body, headers=headers)
        response.raise_for_status()
        return response.json()


def process_places(
    raw_data: Dict[str, Any],
    min_rating: float = 0,
    sort_by_rating: bool = False
) -> List[Dict[str, Any]]:
    results = raw_data.get("places", [])

    if sort_by_rating:
        results.sort(key=lambda x: x["rating"], reverse=True)

    return results
