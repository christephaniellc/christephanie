from fastapi import FastAPI
from mangum import Mangum
from .routers import guests

app = FastAPI()

app.include_router(guests.router)

# Create a handler for AWS Lambda
handler = Mangum(app)