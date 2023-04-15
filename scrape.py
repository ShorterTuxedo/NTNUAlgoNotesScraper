import requests, bs4, re, os, threading, time

from selenium.webdriver.common.by import By

DELETE_EXISTING_FOLDERS=True
WAIT_FOR_ME=0

from selenium import webdriver
from selenium.webdriver.chrome.options import Options
chrome_options = Options()
chrome_options.add_argument("--headless")
browser = webdriver.Chrome(options=chrome_options)
ua="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36"
parser = "lxml"

def set_attribute(browser, el, attr, val):
    if attr not in ["innerText", "outerText", "innerHTML", "outerHTML"]:
        browser.execute_script(f"arguments[0].setAttribute(`{attr}`,`{val}`)", el)
    else:
        browser.execute_script(f"arguments[0][`{attr}`]=`{val}`", el)

def get_attribute(browser, el, attr):
    if attr not in ["innerHTML", "outerHTML", "innerText", "outerText"]:
        tn = el.get_attribute("tagName").lower()
        d = bs4.BeautifulSoup(el.get_attribute("outerHTML"),parser).select_one(tn)
        # print(d)
        return d[attr]
    else:
        browser.execute_script(f"arguments[0].getAttribute(`{attr}`)", el)
def links(add, root, link):
    myLink = add
    if not (myLink.startswith("//") or myLink.startswith("http")):
        if myLink.startswith("/"):
            myLink = root + myLink
        else:
            myNewLink = link.split("/")
            myLink = myLink.split("/")
            for x in myLink:
                if x == "..":
                    myNewLink.pop()
                else:
                    myNewLink.append(x)
            myLink = "/".join(myNewLink)
            myLink = myLink.replace("//","/")
            myLink = myLink.replace(":/", "://")
    return myLink

nthu_home = str(requests.get("https://web.ntnu.edu.tw/~algo/", headers={"Accept-Encoding": "UTF-8"}).content, encoding="UTF-8")
nthu_home = bs4.BeautifulSoup(nthu_home, parser)

stuff_with_src = ["audio", "embed", "iframe", "img", "input", "script", "source", "track", "video"]

folderName = "assets"
try:
    os.rmdir(folderName)
except:
    pass
try:
    os.mkdir(folderName)
except:
    pass

for link in nthu_home.select("a"): #[147:154]:
    myLink = link["href"]
    myLink = links(myLink, "https://web.ntnu.edu.tw/", "https://web.ntnu.edu.tw/~algo/")
    myPage = str(requests.get(myLink, headers={"Accept-Encoding": "UTF-8"}).content, encoding="UTF-8")
    # myPage = bs4.BeautifulSoup(myPage, parser)
    with open("temp.html", "w", encoding="UTF-8") as ff:
        ff.write(myPage)
    browser.get("file://"+("/" if os.name=="nt" else "")+os.getcwd().replace("\\","/")+"/temp.html")
    browser.execute_script("document.querySelectorAll('div.m').forEach(d=>d.parentElement.removeChild(d));")
    folderName = browser.find_element(By.CSS_SELECTOR, "title").get_attribute("innerText")[:-8]
    folderName = "".join(ch for ch in folderName if (ch.isalnum() or re.search(u'[\u4e00-\u9fff]', ch)))
    print("="*10+"Scraping",folderName,"="*10)
    if os.path.exists(folderName):
        if DELETE_EXISTING_FOLDERS:
            try:
                os.rmdir(folderName)
            except:
                print("Error occured while deleting folder! Aborting...")
                pass
        else:
            continue
    try:
        print("It exists! aborting...")
        os.mkdir(folderName)
    except:
        pass
    for src_item in stuff_with_src:
        print("Searching for assets -", src_item)
        for mySrc in browser.find_elements(By.CSS_SELECTOR, src_item):
            try:
                x = get_attribute(browser, mySrc, "src")
                print(x)
                if len(x)==0:
                    abc = 0
                    abc /= 0
                x = links(x, "https://web.ntnu.edu.tw/", "https://web.ntnu.edu.tw/~algo/")
                def k(links, x):
                    print("Possible asset file found, it's", src_item)
                    try:
                        print("Source file: ", x)
                        y = "assets/"+x.split("/")[-1]
                        if os.path.exists(y):
                            print("file exists! aborting...")
                            return 0
                        with open(y, "wb") as f:
                            f.write(requests.get(x, headers={"User-Agent": ua}).content)
                    except Exception:
                        print("Some details: ", e)
                        print("something went wrong! - there was no src code probably")
                threading.Thread(target=k, args=[links, x]).start()
                set_attribute(browser, mySrc, "src", (get_attribute(browser, mySrc, "src") if x==get_attribute(browser, mySrc, "src") else "../assets/"+get_attribute(browser, mySrc, "src").split("/")[-1]))
                time.sleep(0.05)
            except Exception as e:
                print("details: ", e)
                print("some issue")
    for mySrc in browser.find_elements(By.CSS_SELECTOR, "link"):
        try:
            x = get_attribute(browser, mySrc, "href")
            if len(x)==0:
                abc = 0
                abc /= 0
            x = links(x, "https://web.ntnu.edu.tw/", "https://web.ntnu.edu.tw/~algo/")
            def k(links, x):
                try:
                    print("Source file: ", x)
                    y = "assets/"+x.split("/")[-1]
                    if os.path.exists(y):
                        print("file exists! aborting...")
                        return 0
                    with open(y, "wb") as f:
                        f.write(requests.get(x, headers={"User-Agent": ua}).content)
                except Exception as e:
                    print("Some details: ", e)
                    print("something went wrong! - there was no src code probably")
            threading.Thread(target=k, args=[links, x]).start()
            set_attribute(browser, mySrc, "href", (get_attribute(browser, mySrc, "href") if x==get_attribute(browser, mySrc, "href") else "../assets/"+get_attribute(browser, mySrc, "href").split("/")[-1]))
            time.sleep(0.05)
        except Exception as e:
            print("details: ", e)
            print("some issue")
    time.sleep(WAIT_FOR_ME)
    for myNote in browser.find_elements(By.CSS_SELECTOR, "div.a"):
        set_attribute(browser, browser.find_element(By.CSS_SELECTOR, "title"),"innerHTML", myNote.find_elements(By.CSS_SELECTOR, "p.b")[0].get_attribute("innerText"))
        htmlCode = "<!DOCTYPE html><html>"+browser.find_element(By.CSS_SELECTOR, "head").get_attribute("outerHTML")+"<body>"+myNote.get_attribute("outerHTML")+"</body></html>"
        text = myNote.find_element(By.CSS_SELECTOR, "p.b").text
        text = "".join(ch for ch in text if (ch.isalnum() or re.search(u'[\u4e00-\u9fff]', ch)))
        text += ".html"
        with open(f"{folderName}/{text}", "w", encoding="UTF-8") as f:
            f.write(htmlCode)