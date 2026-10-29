#!/usr/bin/env python3
"""Fetch private ClickUp tasks; publish only aggregate progress as JSON.

Used by the GitHub Pages workflow. Requires CLICKUP_API_TOKEN to be set as a
GitHub Actions repository secret; the token is never written into the site.
"""
from __future__ import annotations

import json
import os
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

LIST_ID = "1000450000001486"
STAGES = ("Pitch", "Alpha", "Beta", "Full Release")
DESTINATION = Path(__file__).with_name("progress.json")


def get_tasks_page(token: str, page: int) -> list[dict]:
    url = (
        f"https://api.clickup.com/api/v2/list/{LIST_ID}/task?"
        + urlencode({"page": page, "include_closed": "true", "subtasks": "true"})
    )
    request = Request(
        url,
        headers={"Authorization": token, "Accept": "application/json", "User-Agent": "MorphProgress/1.1"},
    )
    for attempt in range(5):
        try:
            with urlopen(request, timeout=35) as response:
                response_data = json.load(response)
            tasks = response_data.get("tasks")
            if not isinstance(tasks, list):
                raise ValueError("ClickUp did not return a task list")
            return tasks
        except HTTPError as error:
            if error.code not in (429, 500, 502, 503, 504) or attempt == 4:
                raise
        except (URLError, TimeoutError):
            if attempt == 4:
                raise
        time.sleep(2**attempt)
    raise RuntimeError("ClickUp pagination failed")


def status_label(task: dict) -> str:
    raw = task.get("status") or {}
    return str(raw.get("status", "") if isinstance(raw, dict) else raw).strip()


def is_complete(task: dict) -> bool:
    raw = task.get("status") or {}
    if isinstance(raw, dict) and str(raw.get("type", "")).casefold() in ("closed", "done"):
        return True
    return status_label(task).casefold() in ("complete", "completed", "done", "closed")


def get_stage(task: dict) -> str | None:
    for field in task.get("custom_fields") or []:
        if str(field.get("name", "")).casefold() != "suggested stage":
            continue
        value = field.get("value")
        if not isinstance(value, str):
            options = (field.get("type_config") or {}).get("options") or []
            value = next(
                (option.get("name") for option in options if option.get("id") == value or option.get("orderindex") == value),
                None,
            )
        norm = str(value or "").casefold().replace(" ", "").strip()
        for stage in STAGES:
            if norm == stage.casefold().replace(" ", ""):
                return stage
    # Stage-specific TO DO status is an alternative when a custom field is blank.
    status = status_label(task).casefold().replace("—", "-").replace("–", "-")
    if status.startswith(("to do", "todo")):
        for stage in STAGES:
            if stage.casefold() in status:
                return stage
    return None


def main() -> None:
    token = os.environ.get("CLICKUP_API_TOKEN", "").strip()
    if not token:
        raise SystemExit("Missing CLICKUP_API_TOKEN GitHub repository secret")

    all_tasks: dict[str, dict] = {}
    for page in range(200):
        batch = get_tasks_page(token, page)
        for task in batch:
            if task.get("id"):
                all_tasks[str(task["id"])] = task
        if len(batch) < 100:
            break
    else:
        raise RuntimeError("More than 200 ClickUp result pages; refusing to report incomplete data")
    if not all_tasks:
        raise RuntimeError("No ClickUp tasks found; refusing to overwrite last good report")

    stages = {name: {"done": 0, "total": 0} for name in STAGES}
    completed = 0
    unassigned = 0
    for task in all_tasks.values():
        done = is_complete(task)
        completed += int(done)
        stage = get_stage(task)
        if stage is None:
            unassigned += 1
        else:
            stages[stage]["total"] += 1
            stages[stage]["done"] += int(done)

    summary = {
        "version": 1,
        "source": "clickup",
        "updatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "overall": {"done": completed, "total": len(all_tasks)},
        "stages": stages,
        "unassigned": unassigned,
    }
    DESTINATION.write_text(json.dumps(summary, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Morph summary generated: {completed}/{len(all_tasks)}. Only aggregate totals are published.")


if __name__ == "__main__":
    main()
