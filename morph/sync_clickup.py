#!/usr/bin/env python3
"""Update public Morph completion counts from ClickUp. Never publish raw tasks or API keys."""
import json
import os
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from urllib.error import HTTPError, URLError

LIST_ID = "1000450000001486"
STAGES = ("Pitch", "Alpha", "Beta", "Full Release")
OUTPUT = Path(__file__).with_name("progress.json")

def get_stage(task):
    for f in task.get("custom_fields") or []:
        if str(f.get("name","")).casefold() == "suggested stage":
            value = f.get("value")
            if not isinstance(value, str):
                opts = (f.get("type_config") or {}).get("options") or []
                value = next((x.get("name") for x in opts if x.get("id") == value or x.get("orderindex") == value), "")
            if value:
                for stage in STAGES:
                    if str(value).strip().casefold().replace(" ","") == stage.casefold().replace(" ",""):
                        return stage
    status = task.get("status") or {}
    label = status.get("status","") if isinstance(status,dict) else str(status)
    normalized = label.casefold().replace("—","-").replace("–","-")
    if normalized.startswith(("to do","todo")):
        for stage in STAGES:
            if stage.casefold() in normalized:
                return stage
    return None

def completed(task):
    status = task.get("status") or {}
    if isinstance(status, dict):
        if str(status.get("type","")).casefold() in ("closed","done"):
            return True
        label = status.get("status","")
    else:
        label = str(status)
    return label.casefold() in ("complete","completed","closed","done")

def fetch_page(token, page):
    url = "https://api.clickup.com/api/v2/list/"+LIST_ID+"/task?"+urlencode({"page":page,"include_closed":"true","subtasks":"true"})
    for attempt in range(4):
        req = Request(url,headers={"Authorization":token,"Accept":"application/json","User-Agent":"MorphProgress/1.0"})
        try:
            with urlopen(req,timeout=30) as response:
                body=json.load(response)
            result=body.get("tasks")
            if not isinstance(result,list):
                raise ValueError("Unexpected ClickUp response")
            return result
        except HTTPError as e:
            if e.code not in (429,500,502,503) or attempt==3:
                raise
        except URLError:
            if attempt==3:
                raise
        time.sleep(2**attempt)
    raise RuntimeError("Unable to fetch ClickUp")

def main():
    token = os.environ.get("CLICKUP_API_TOKEN","").strip()
    if not token:
        raise SystemExit("Missing CLICKUP_API_TOKEN repository secret")
    tasks=[]
    for page in range(100):
        batch=fetch_page(token,page)
        tasks.extend(batch)
        if len(batch)<100:
            break
    else:
        raise RuntimeError("Pagination safety limit reached")
    unique={str(t["id"]):t for t in tasks if t.get("id")}
    if not unique:
        raise RuntimeError("Refusing to publish an empty task list")
    stages={s:{"done":0,"total":0} for s in STAGES}
    done_total=0
    unassigned=0
    for task in unique.values():
        is_done=completed(task)
        done_total+=int(is_done)
        stage=get_stage(task)
        if stage:
            stages[stage]["total"]+=1
            stages[stage]["done"]+=int(is_done)
        else:
            unassigned+=1
    report={"version":1,"source":"clickup","updatedAt":datetime.now(timezone.utc).isoformat(timespec="seconds"),"overall":{"done":done_total,"total":len(unique)},"stages":stages,"unassigned":unassigned}
    OUTPUT.write_text(json.dumps(report,indent=2,ensure_ascii=False)+"\n",encoding="utf-8")
    print("Updated public Morph progress: %s/%s. No private task details published."%(done_total,len(unique)))

if __name__=="__main__":
    main()
