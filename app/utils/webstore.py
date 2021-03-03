import json
from time import sleep
import requests
from cloudaio import tlsexpert
import uuid
import random
s = requests.session()
stylecode = 'DB5074-101'
stop = False
storage = {}
sizes = ['9']
cookie = '_abck=42D4E2E416589130C76B07375A19C056~-1~YAAQwArGF1ovWzJ1AQAAFVlARAS+j6F2rlSe4zrahotRz7GSQSWK5sEIKBw84/F206ZvoZUygpHQDG2YE7a/6qDtXywJFj1qo80QXunTlvRzSb9Ir3ImsuxW2d1aiy+bJXLo/yXYCOuetAXkjg2A5oCOke/NNXdy237kNClxK+sKyTBOKevR+D+E1/NGMYiEpaAzD16lT+2zRGyEuEbaP+zB3uPBJFhWZmoCmaqlwzO4DURy2G6ezrTVix6pnEtqBc8ZnwXDj9EbIet9NllmEsaBbg4J0KVTDZNrj8KC06X9kQY76KG7ySYQo76J/0q87+rdbNLPerfEMa6EEmEA1BALEvPu/QekZodLy4wSyk78/OshgKGI04hEw/A507k+jyvj2bMaRxMDZL6CBfvbNI0pLPWNBKdI38rytTrR7CmgFjb36bypW+EX9+K5CA99EYXszg==~-1~-1~-1;bm_sz=2B6D19B104CB409988B860E3EFE6EFEF~YAAQwArGFw8uWzJ1AQAAbkBARAmC3kWjspX7DFScuMysLDd9PdAF5cLWQ/pCFM4kl5WauGx51hwgvP51RoEjABxOcClhVbzjJkiRUM9nStEYbG44nHc0RZp+5JscnidJMcNh5Mtx/WKLVAI+ZFCcbqTdL/mb1bdGExlbiO11DWzzk6JVgeJMoDf4u4887uoocgyJjo+kwWkmHXUZpj4k5XfCr2IaEbQ+hLlCMOU+qWprIs8ZKdQiWEb8cKSjsfltIL2MUPanCcQIdnN8m/8F0FuevUIBGqN/FKg=;'
region = 'SG'
visitor = str(uuid.uuid4())
url = 'https://api.nike.com/buy/partner_cart_preorder/v1/' + str(uuid.uuid4())
proxy1 = '108.165.18.67:14025'
proxy = {"http": "http://" + proxy1, "https": "https://" + proxy1}
s.proxies.update(proxy)
maxlimit = None


def details():
    global region,stylecode,maxlimit
    try:
        url = 'https://api.nike.com/product_feed/threads/v2?filter=marketplace({r})&filter=language(en-GB)&filter=channelId(d9a5bc42-4b9c-4976-858a-f159cf99c647)&filter=publishedContent.properties.products.styleColor({s})'.format(
            r=region, s=stylecode)
        y = s.get(url).json()
        try:
            # (y['objects'][0]["productInfo"][0]["merchProduct"]["status"],y['objects'][0]["productInfo"][0]["merchProduct"]["styleCode"],y['objects'][0]["productInfo"][0]["merchProduct"]["labelName"],)
            if y['objects'][0]["productInfo"][0]["merchProduct"]["status"] in ['CLOSEOUT', 'ACTIVE', 'INACTIVE', "HOLD"]:

                status = y['objects'][0]["productInfo"][0]["merchProduct"]["status"]
                #stylecode = y['objects'][0]["productInfo"][0]["merchProduct"]["styleColor"]
                name = y['objects'][0]["productInfo"][0]["merchProduct"]["labelName"]
                maxlimit = y['objects'][0]["productInfo"][0]["merchProduct"]["quantityLimit"]
                price = y['objects'][0]["productInfo"][0]["merchPrice"]["currentPrice"]
                for z in y['objects'][0]["productInfo"][0]["skus"]:
                    storage[z["nikeSize"]] = z["id"]

                return True

            else:
                print(json.dumps(
                    {
                        "status": "0",
                        "message": "Product is not live..."
                    }
                ))
                return False
        except:
            print(json.dumps(
                {
                    "status": "0",
                    "message": "Product was not found..."
                }
            ))
            sleep(5)
            return False


    except:
        print(json.dumps(
            {
                "status": "0",
                "message": "Error fetching skus..."
            }
        ))

def monitor():
    url = 'https://api.nike.com/cic/grand/v1/graphql'
    headers = {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.5',
        'appid': 'com.nike.commerce.nikedotcom.web',
        'Cache-Control': 'no-cache',
        'cloud_stack': 'cart_applause_test',
        'Connection': 'keep-alive',
        'Content-Length': '194',
        'Content-Type': 'application/json; charset=UTF-8',
        'Host': 'api.nike.com',
        'nike-api-caller-id': 'com.nike.commerce.nikedotcom.web',
        'Origin': 'https://www.nike.com',
        'Pragma': 'no-cache',
        'Referer': 'https://www.nike.com/ca/en/cart',
        'TE': 'Trailers',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:77.0) Gecko/20100101 Firefox/77.0',
        'X-B3-SpanName': 'CiCCart',
        'X-B3-TraceId': str(uuid.uuid4()),
        'X-Nike-VisitId': '3',
        'X-Nike-VisitorId': str(uuid.uuid4()),
    }

    skulist = []
    key, value = random.choice(list(storage.items()))
    skulist.append(value)

    data = {
        "hash": "ef571ff0ac422b0de43ab798cc8ff25f",
        "variables":
            {"ids": skulist,
             "country": "CA",
             "language": "en-GB",
             "isSwoosh": False}}

    # print(x)

    try:
        x = s.post(url, headers=headers, json=data).json()
        print(json.dumps(
            {
                "status": "0",
                "message": "Monitoring..."
            }
        ))
        for y in x['data']['skus'][0]['product']['skus']:
            if y['availability']['level'] != 'OOS':
                if y['id'] in [storage[str(z)] for z in sizes if z in storage.keys()]:
                    size = helper(y['id'])
                    print(json.dumps(
                        {
                            "status": "0",
                            "message": "Added to cart..."
                        }
                    ))
                    return True, size



    except:
        try:
            if x['errors'] != []:
                # print(colored('[' + str(dt.datetime.now()) + '] [Task #' + str(instance) + '] {} {}!', 'yellow').format(name, x['errors'][0]['message']))
                return False, None

        except:
            print(json.dumps(
                {
                    "status": "0",
                    "message": "Banned proxy..."
                }
            ))
            return False, None

    sleep(5)

def atc(size):
    global url
    puthead = {
        'Accept': 'application/json; charset=UTF-8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.5',
        'appid': 'com.nike.commerce.nikedotcom.web',
        'Cache-Control': 'no-cache',
        'Cookie': cookie,
        'cloud_stack': 'buy_domain',
        'Connection': 'keep-alive',
        'Content-Type': 'application/json; charset=UTF-8',
        'Host': 'api.nike.com',
        'Origin': 'https://www.nike.com',
        'Pragma': 'no-cache',
        'Referer': 'https://www.nike.com/ca/en/cart',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36',
        'X-B3-SpanName': 'undefined',
        'X-B3-TraceId': str(uuid.uuid4()),
        'x-nike-visitid': '1',
        'x-nike-visitorid': visitor,
    }
    cur = None
    if region == "SG":
        cur = "SGD"
    if region == "MY":
        cur = "MYR"
    senddata2 = {
        "country": region,
        "language": "en-GB",
        "channel": "NIKECOM",
        "cartId": str(uuid.uuid4()),
        "currency": cur,
        "paypalClicked": False,
        "items": [
            {"id": str(uuid.uuid4()),
             "skuId": size,
             "quantity": maxlimit}]}
    good = False
    try:
        x = tlsexpert.request('sby5ayjfD5PxA36dN7Rr4smNmkqqKdyV3rxVaRCK4FZdcYHm', 'PUT', url, proxy["http"], puthead, json.dumps(senddata2))
        x = json.loads(x)
        good = True
    except:
        print(json.dumps(
            {
                "status": "0",
                "message": "Timeout error..."
            }
        ))

    if good:
        if x['Status'] == 202:
            print(json.dumps(
                {
                    "status": "1",
                    "message": "Successfully added to cart..."
                }
            ))
            return True

        else:
            print(json.dumps(
                {
                    "status": "0",
                    "message": "Failed add to cart..."
                }
            ))
            return False

def check_order():
    global url
    puthead = {
        'Accept': 'application/json; charset=UTF-8, application/json',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.5',
        'appid': 'com.nike.commerce.nikedotcom.web',
        'Cache-Control': 'no-cache',
        'cloud_stack': 'buy_domain',
        'Connection': 'keep-alive',
        'Content-Type': 'application/json; charset=UTF-8',
        # 'Cookie': '_abck=D9DAD9645F0BD1A7620CFE347533A46D~-1~YAAQhwXGFwbuLr9xAQAA+O+kJgNuJz+bgXqTSxmJJRi6WnlLahkTaoPXo+fz0hIGw5RIkG3aECc348nnUFjZASY433FpeC6SAQDK93IRZTbfzqt++2k8gpMv/4vPoMB1k6xgZhrwEs+1tXGxmvRP8dPFvz2fSOGYnTJdK0lcbygjUYszsG7y/sedZBJ144RDB7eim3l+P0ooBslY5oFSgihLz5YjFeaVmmUApy2ES2hcufORPWkjCil/3LBBNQ/fZXWXHeznYqTBE/jEg6xylKpQ0aNVqRkVTloj5BhETT9GT0T+JMoyP3I08d+pOc9YjKwTMpbf3+YiyFI7jPomY4oIxA==~-1~-1~-1;',
        'Host': 'api.nike.com',
        'Origin': 'https://www.nike.com',
        'Pragma': 'no-cache',
        'Referer': 'https://www.nike.com/ca/en/cart',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.135 Safari/537.36',
        'X-B3-SpanName': 'CiCCart',
        'X-B3-TraceId': '2a68677b-68b4-4781-a0b2-a71fdb9d5ee1',
        'x-nike-visitid': '1',
        'x-nike-visitorid': visitor,
    }
    good = False
    try:
        x = tlsexpert.request('sby5ayjfD5PxA36dN7Rr4smNmkqqKdyV3rxVaRCK4FZdcYHm', 'GET', url, proxy["http"], puthead)
        x = json.loads(x)
        good = True
    except:
        print('timeout error')
    if good:
        if x["Status"] == 200:
            x = json.loads(x['Body'])
            if x['status'] == 'IN_PROGRESS':
                print(json.dumps(
                    {
                        "status": "0",
                        "message": "Order in progress..."
                    }
                ))
                sleep(1)
                check_order()

            else:
                try:
                    url = x["response"]["redirectUrl"]
                    print(json.dumps(
                        {
                            "status": "1",
                            "message": "Got Cart..."
                        }
                    ))
                    print(url)
                    url = url
                    print(json.dumps(
                        {
                            "status": "2",
                            "message": "Sent Cart Link!",
                            "url": url,
                            "productImage": 'https://secure-images.nike.com/is/image/DotCom/' + stylecode.replace("-", "_"),
                            "size": str(sizes[0]),
                        }
                    ))
                except:
                    print(json.dumps(
                        {
                            "status": "0",
                            "message": "Out of stock..."
                        }
                    ))
        else:
            print(json.dumps(
                {
                    "status": "0",
                    "message": "Error getting cart..."
                }
            ))

def helper(skuid):
    for y in storage:
        if skuid == storage[y]:
            return storage[y]

print(json.dumps(
    {
        "status": "0",
        "message": "Starting..."
    }
))
# Fetch Product details
found = details()
while not found:
    found = details()


# Your monitor code
status,size = monitor()
while not status:
    status, size = monitor()

# Later on you branch  to ATC

success = atc(size)

if success:
    check_order()
#Now tell the UI to show the success to the user



