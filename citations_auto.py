import os
import httpx
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
GOOGLE_CX_ID = os.getenv("GOOGLE_CX_ID")

TRUSTED_DOMAINS = [
    "cdc.gov",
    "nih.gov",
    "mayoclinic.org",
    "who.int",
    "medlineplus.gov",
    "healthline.com",
    "webmd.com",
    "clevelandclinic.org",
    "hopkinsmedicine.org"
]


def extract_source(url: str):
    """Return short source name like 'CDC' or 'NIH'."""
    for domain in TRUSTED_DOMAINS:
        if domain in url:
            return domain.split('.')[0].upper()
    return "OTHER"


def search_citations(symptom: str, max_results: int = 10):
    """Search trusted medical sources for citations related to a symptom."""
    if not GOOGLE_API_KEY or not GOOGLE_CX_ID:
        raise ValueError("Missing GOOGLE_API_KEY or GOOGLE_CX_ID in .env file")

    citations = []
    with httpx.Client(timeout=10.0) as client:
        # Broad search across the web, not just limited sites
        response = client.get(
            "https://www.googleapis.com/customsearch/v1",
            params={
                "key": GOOGLE_API_KEY,
                "cx": GOOGLE_CX_ID,
                "q": symptom,
                "num": max_results,
            },
        )

        data = response.json()
        items = data.get("items", [])

        # Filter for relevant or trusted results
        for item in items:
            link = item.get("link", "")
            title = item.get("title", "")
            snippet = item.get("snippet", "")

            if any(domain in link for domain in TRUSTED_DOMAINS) or any(
                word in title.lower() for word in ["symptom", "disease", "medical", "health", "fever", "treatment"]
            ):
                citations.append({
                    "title": title,
                    "url": link,
                    "snippet": snippet,
                    "source": extract_source(link),
                })

    return citations[:max_results]


# ---------- Simple Test Run ----------
if __name__ == "__main__":
    symptom = input("Enter a symptom to search citations for: ")
    results = search_citations(symptom)
    print("\nTop Medical Citations:\n")

    if not results:
        print("No relevant citations found. Try a different symptom.\n")
    else:
        for c in results:
            print(f"• {c['title']} ({c['source']})")
            print(f"  {c['url']}")
            print(f"  → {c['snippet']}\n")
