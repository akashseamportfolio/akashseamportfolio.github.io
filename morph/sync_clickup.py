#!/usr/bin/env python3
"""Fetch private ClickUp tasks; publish only aggregate progress as JSON.

Used by the GitHub Pages workflow. Requires CLICKUP_API_TOKEN to be set as a
GitHub Actions repository secret; the token is never written into the site.
"""
from __future__ import annotations

import json
import os
import re
import time
from datetime import datetime, timezone
from pathlib import Path
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen

LIST_ID = "1000450000013753"
STAGES = ("Greybox", "Pitch", "Alpha", "Beta", "Full Release")
# Imported granular tasks contain "Suggested stage: ..." in their descriptions.
# A unique explicit stage tag overrides that provisional stage. Stage totals
# are then computed from the current task inventory on every sync.
SUGGESTED_STAGE_PATTERN = re.compile(
    r"Suggested\s+stage\s*:\s*(Greybox|Pitch|Alpha|Beta|Full Release)\b", re.IGNORECASE
)
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
    """Prefer a unique ClickUp stage tag; fall back to imported stage text.

    A conflicting set of stage tags is explicitly unassigned. Untagged
    imported MOR tasks use their existing Suggested stage description until
    an explicit stage tag reassigns them. Fall back to the stable task-name prefix, then an explicit stage status.
    """
    matches: set[str] = set()
    for tag in task.get("tags") or []:
        name = tag.get("name", "") if isinstance(tag, dict) else str(tag)
        normalized = " ".join(
            str(name).casefold().replace(":", " ").replace("-", " ").split()
        )
        if normalized.startswith("stage "):
            normalized = normalized[6:]
        if normalized.endswith(" stage"):
            normalized = normalized[:-6]
        for stage in STAGES:
            if normalized == stage.casefold():
                matches.add(stage)

    if len(matches) > 1:
        return None
    if len(matches) == 1:
        return next(iter(matches))

    description = task.get("description") or task.get("text_content") or task.get("markdown_description") or ""
    if not isinstance(description, str):
        return None
    suggested = SUGGESTED_STAGE_PATTERN.search(description)
    if suggested:
        return next(
            stage for stage in STAGES
            if stage.casefold() == suggested.group(1).casefold()
        )
    # The stable name prefix survives moves into Current, Waiting or Complete.
    prefix = re.match(r"^\[([GPABF])\]", str(task.get("name", "")), re.IGNORECASE)
    if prefix:
        return dict(zip("GPABF", STAGES))[prefix.group(1).upper()]
    return next((stage for stage in STAGES if stage.casefold() == status_label(task).casefold()), None)

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
    completed_unassigned = 0
    for task in all_tasks.values():
        done = is_complete(task)
        completed += int(done)
        stage = get_stage(task)
        if stage is None:
            unassigned += 1
            completed_unassigned += int(done)
        else:
            stages[stage]["total"] += 1
            stages[stage]["done"] += int(done)

    summary = {
        "version": 2,
        "source": "clickup",
        "updatedAt": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "overall": {"done": completed, "total": len(all_tasks)},
        "stages": stages,
        "unassigned": unassigned,
    }
    DESTINATION.write_text(json.dumps(summary, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Morph summary generated: {completed}/{len(all_tasks)}. Only aggregate totals are published.")
    print(
        "Morph stage assignments (tags, then imported suggestions): "
        + ", ".join(
            f"{stage}={stages[stage]['done']}/{stages[stage]['total']} "
            f"(assigned={stages[stage]['total']})"
            for stage in STAGES
        )
        + f"; unassigned={unassigned}, completed_unassigned={completed_unassigned}."
    )


if __name__ == "__main__":
    main()

