# GDELT context temporal insight payloads

The `/api/gdelt?action=context&…` proxy can surface `insights.temporal_distribution` or `insights.timeline` in a few different shapes. The samples below were captured while querying the Poly GDELT proxy and trimmed for brevity so we can document how the structures differ.

## 1. Flat array payload

`GET /api/gdelt?action=context&date_start=20240101&date_end=20240107&include_insights=true&limit=25`

```json
{
  "insights": {
    "temporal_distribution": [
      { "date": "2024-01-01", "count": 96 },
      { "date": "2024-01-02", "count": 104 },
      { "date": "2024-01-03", "count": 88 }
    ]
  }
}
```

## 2. Keyed object payload

`GET /api/gdelt?action=context&keywords=energy&date_start=20240101&date_end=20240107&include_insights=true`

```json
{
  "insights": {
    "temporal_distribution": {
      "2024-01-01": { "date": "2024-01-01", "count": 54 },
      "2024-01-02": { "date": "2024-01-02", "count": 61 },
      "2024-01-03": { "date": "2024-01-03", "count": 59 }
    }
  }
}
```

## 3. Nested series payload

`GET /api/gdelt?action=context&keywords=ai&date_start=20231201&date_end=20240115&include_insights=true`

```json
{
  "insights": {
    "temporal_distribution": {
      "series": [
        {
          "label": "Relative coverage",
          "timeline": [
            { "date": "2023-12-01", "value": 0.18 },
            { "date": "2023-12-02", "value": 0.21 }
          ]
        }
      ]
    }
  }
}
```

## 4. Timeline fallback payload

`GET /api/gdelt?action=context&keywords=geopolitics&date_start=20240201&date_end=20240215&include_insights=true`

```json
{
  "insights": {
    "temporal_distribution": [],
    "timeline": {
      "series": [
        {
          "name": "Events",
          "data": [
            { "label": "2024-02-01", "total": 120 },
            { "label": "2024-02-02", "total": 134 }
          ]
        }
      ]
    }
  }
}
```
