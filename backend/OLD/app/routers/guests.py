from fastapi import APIRouter

router = APIRouter()


@router.get("/guests")
async def get_guests():
    return {"message": "List of guests"}


@router.post("/guests")
async def add_guest(guest: dict):
    return {"message": "Guest added", "guest": guest}
