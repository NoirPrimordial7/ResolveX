# ResolveX API Testing and Deployment Plan

Use this after backend is running locally or deployed.

## Local backend
```cmd
cd /d E:\ResolveX\resolvex\backend
venv\Scripts\activate
python -m uvicorn app.main:app --reload
```

## Postman import
Import these files:
- ResolveX_Postman_Collection.json
- ResolveX_Postman_Local_Environment.json

Select the ResolveX Local environment and run folders in order:
00 Health / Docs -> 01 Auth -> 02 Customer Tickets -> 03 Admin -> 04 Security / Role Tests.

## Production environment
After Render deploy, import ResolveX_Postman_Production_Environment.json and set base_url to your Render URL.
