import httpx
import asyncio

async def fetch(url,params=None,key=None,returnKey=None):
    async with httpx.AsyncClient() as client:
        response = await client.get(url,params=params)
        res = response.json()
        if not key is None:
            res['id-request'] = key
        if not returnKey is None:
            res['key-request'] = returnKey
        return res

def fetch_data(endpoint_list):
    loop = asyncio.new_event_loop()
    asyncio.set_event_loop(loop)
    if isinstance(endpoint_list,dict):
        tup_list = []
        for key, vals in endpoint_list.items():
            for val in vals:
                tup_list.append((val[1],None,key,val[0]))
        results = loop.run_until_complete(asyncio.gather(*(fetch(url, params, key, returnKey) for url, params, key, returnKey in tup_list)))
    else:
        results = loop.run_until_complete(asyncio.gather(*(fetch(url, params) for url, params in endpoint_list)))
    return results