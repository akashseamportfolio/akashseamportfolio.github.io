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
# Original roadmap estimates. Until all tasks have stage tags, these are
# planning denominators rather than counts of tasks currently carrying a tag.
PLANNED_STAGE_TOTALS = {
    "Pitch": 92,
    "Alpha": 117,
    "Beta": 76,
    "Full Release": 18,
}
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
    """Classify a task exclusively by its ClickUp Tags field.

    A task with no stage tag, or with conflicting stage tags, stays
    unassigned. We never use the locked Suggested Stage custom field.
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
    return next(iter(matches)) if len(matches) == 1 else None

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

    stages = {name: {"done": 0, "total": planned} for name, planned in PLANNED_STAGE_TOTALS.items()}
    tagged_counts = {name: 0 for name in STAGES}
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
            tagged_counts[stage] += 1
            stages[stage]["done"] += int(done)

    # Once the number of tagged tasks exceeds an original estimate, expand
    # its denominator. This prevents counts or progress exceeding 100%.
    for stage in STAGES:
        stages[stage]["total"] = max(
            PLANNED_STAGE_TOTALS[stage], tagged_counts[stage]
        )

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
    print(
        "Morph tag-based stages: "
        + ", ".join(
            f"{stage}={stages[stage]['done']}/{stages[stage]['total']} "
            f"(tagged={tagged_counts[stage]})"
            for stage in STAGES
        )
        + f"; unassigned={unassigned}, completed_unassigned={completed_unassigned}."
    )


if __name__ == "__main__":
    main()
