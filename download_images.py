#!/usr/bin/env python3
"""
Download images from an interiorcompany.com design-ideas page, sorted into
folders by category.

Usage:
    python download_images.py "https://www.interiorcompany.com/in/interior-design-ideas/wardrobe/green-wd_15" -o downloads --designs-only

    # Listing pages are paginated via a `page` query param; the script walks
    # page=1, 2, 3, ... automatically and stops once a page has no new
    # design photos (override with --max-pages / --start-page):
    python download_images.py "https://www.interiorcompany.com/in/interior-design-ideas/master-bedroom?page=1" -o downloads --designs-only

Install deps first:
    pip install requests beautifulsoup4

Notes:
    - The site sits behind bot protection (Cloudflare). Running this from a
      normal residential connection with a browser-like User-Agent usually
      works; running it from a datacenter/cloud IP often gets a 403.
    - If you still get blocked, try `pip install cloudscraper` - the script
      will use it automatically if it's installed.
    - Category detection is heuristic (see `guess_category`): real design
      photos (inside a 'kitchenCard' tile) are matched against wardrobe
      door-type keywords in their title/alt text; everything else falls
      back to source-based buckets (blog thumbnails, video thumbnails, site
      icons) or a generic "Other_Wardrobe_Designs"/"Misc" bucket. That
      fallback bucket is where most non-wardrobe categories (kitchens, TV
      units, doors, etc.) end up - re-sort them by hand afterwards, since
      the site reuses the same 'kitchenCard' CSS class for every category.
"""

import argparse
import os
import re
from urllib.parse import parse_qsl, urlencode, urljoin, urlparse, urlunparse

import requests
from bs4 import BeautifulSoup

HEADERS = {
    "User-Agent": (
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
        "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
    ),
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
    "Accept-Language": "en-IN,en;q=0.9",
}


def get_session():
    try:
        import cloudscraper  # type: ignore

        return cloudscraper.create_scraper()
    except ImportError:
        return requests.Session()


def fetch_html(session, url):
    resp = session.get(url, headers=HEADERS, timeout=30)
    resp.raise_for_status()
    return resp.text


def sanitize(name, max_len=80):
    name = re.sub(r"[^\w\-. ]", "_", name).strip().strip(".")
    name = re.sub(r"\s+", "_", name)
    if not name:
        return "misc"
    base, ext = os.path.splitext(name)
    if ext and len(ext) <= 6:
        return base[: max_len - len(ext)] + ext
    return name[:max_len]


def best_src(img):
    """Pick the highest-quality URL available on an <img> tag."""
    for attr in ("data-src", "data-lazy-src", "data-original", "src"):
        val = img.get(attr)
        if val and not val.startswith("data:"):
            return val

    srcset = img.get("srcset") or img.get("data-srcset")
    if srcset:
        candidates = [c.strip().split(" ")[0] for c in srcset.split(",") if c.strip()]
        if candidates:
            return candidates[-1]  # last is usually the largest
    return None


DOOR_TYPE_PATTERNS = [
    (re.compile(r"sliding", re.I), "Sliding_Door_Wardrobes"),
    (re.compile(r"\bswing\b", re.I), "Swing_Door_Wardrobes"),
    (re.compile(r"hinged", re.I), "Hinged_Wardrobes"),
    (re.compile(r"walk[- ]?in", re.I), "Walk_In_Wardrobes"),
    (re.compile(r"open storage|open wardrobe", re.I), "Open_Wardrobes"),
]


def is_design_card(img):
    """True if this <img> is one of the actual wardrobe-design photos
    (interiorcompany.com renders those inside a '...kitchenCard...' div),
    as opposed to a logo, icon, blog thumbnail, or video thumbnail."""
    return (
        img.find_parent(
            lambda tag: tag.has_attr("class")
            and any("kitchenCard" in c for c in tag.get("class", []))
        )
        is not None
    )


def guess_category(img, base_url):
    """
    Category detection tuned to interiorcompany.com's actual layout:
      1. Real design photos (inside a 'kitchenCard' tile) -> bucketed by
         wardrobe door type, parsed from the image's title/alt text.
      2. Blog thumbnails (cms.interiorcompany.com) -> 'Blog_Thumbnails'.
      3. Vastu video thumbnails (i.ytimg.com) -> 'Vastu_Video_Thumbnails'.
      4. Site icons/logos (/assets/images/ or .svg) -> 'Site_Icons_Logos'.
      5. Fallback: alt text, else 'Misc'.
    """
    label = img.get("title") or img.get("alt") or ""

    if is_design_card(img):
        for pattern, name in DOOR_TYPE_PATTERNS:
            if pattern.search(label):
                return name
        return "Other_Wardrobe_Designs"

    src = best_src(img) or ""
    full = urljoin(base_url, src)
    host = urlparse(full).netloc.lower()
    path = urlparse(full).path.lower()

    if "cms.interiorcompany.com" in host:
        return "Blog_Thumbnails"
    if "ytimg.com" in host:
        return "Vastu_Video_Thumbnails"
    if "/assets/images/" in path or path.endswith(".svg"):
        return "Site_Icons_Logos"

    if label:
        return sanitize(label)
    return "Misc"


def set_page_param(url, page):
    """Return `url` with its `page` query parameter set to `page`."""
    parsed = urlparse(url)
    query = dict(parse_qsl(parsed.query))
    query["page"] = str(page)
    return urlunparse(parsed._replace(query=urlencode(query)))


def process_page(session, url, out_dir, designs_only, seen_urls, counts):
    """Fetch one page and download any images not already seen.

    Returns the number of *new* design-card images found on this page,
    which the caller uses to detect the end of pagination.
    """
    try:
        html = fetch_html(session, url)
    except requests.HTTPError as e:
        print(f"  Failed to fetch page: {e}")
        return 0

    soup = BeautifulSoup(html, "html.parser")
    imgs = soup.find_all("img")
    print(f"  Found {len(imgs)} <img> tags on this page.")

    new_design_count = 0

    for img in imgs:
        if designs_only and not is_design_card(img):
            continue
        src = best_src(img)
        if not src:
            continue
        full_url = urljoin(url, src)
        if full_url in seen_urls:
            continue
        seen_urls.add(full_url)
        if is_design_card(img):
            new_design_count += 1

        category = guess_category(img, url)
        cat_dir = os.path.join(out_dir, category)
        os.makedirs(cat_dir, exist_ok=True)

        parsed = urlparse(full_url)
        filename = sanitize(os.path.basename(parsed.path)) or "image.jpg"
        if "." not in filename:
            filename += ".jpg"

        dest = os.path.join(cat_dir, filename)
        base, ext = os.path.splitext(dest)
        n = 1
        while os.path.exists(dest):
            dest = f"{base}_{n}{ext}"
            n += 1

        try:
            r = session.get(full_url, headers=HEADERS, timeout=30)
            r.raise_for_status()
            with open(dest, "wb") as f:
                f.write(r.content)
            counts[category] = counts.get(category, 0) + 1
            print(f"  [{category}] saved {os.path.basename(dest)}")
        except requests.RequestException as e:
            print(f"  Failed to download {full_url}: {e}")

    return new_design_count


def download_images(url, out_dir, designs_only=False, max_pages=20, start_page=None):
    session = get_session()
    os.makedirs(out_dir, exist_ok=True)
    seen_urls = set()
    counts = {}

    parsed = urlparse(url)
    query = dict(parse_qsl(parsed.query))
    page = start_page if start_page is not None else int(query.get("page", 1))

    pages_fetched = 0
    while pages_fetched < max_pages:
        page_url = set_page_param(url, page)
        print(f"Fetching page {page}: {page_url} ...")
        new_count = process_page(session, page_url, out_dir, designs_only, seen_urls, counts)
        pages_fetched += 1
        print(f"  -> {new_count} new design image(s) on page {page}.")

        if new_count == 0:
            print(f"No new design images on page {page}; stopping pagination.")
            break
        page += 1
    else:
        print(f"Reached --max-pages limit ({max_pages}); there may be more pages.")

    print("\nDone.")
    for cat, n in sorted(counts.items()):
        print(f"  {cat}: {n} image(s)")
    if not counts:
        print("  No images were downloaded. The page may render images via "
              "JavaScript, in which case a plain requests-based fetch won't "
              "see them - a browser-automation tool (e.g. Playwright/Selenium) "
              "would be needed instead.")
        print("  If the very first fetch failed with a 403, try running from a "
              "normal (non-cloud) network connection, or install cloudscraper: "
              "pip install cloudscraper")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("url", help="Page URL to scrape")
    parser.add_argument("-o", "--output", default="downloads", help="Output directory")
    parser.add_argument(
        "--designs-only",
        action="store_true",
        help="Skip site chrome (logos, icons, blog/video thumbnails) and only "
        "download the actual design photos",
    )
    parser.add_argument(
        "--max-pages",
        type=int,
        default=20,
        help="Maximum number of pages to walk through '?page=N' pagination "
        "(default: 20). The script stops earlier on its own once a page "
        "has no new design photos.",
    )
    parser.add_argument(
        "--start-page",
        type=int,
        default=None,
        help="Page number to start from (default: the 'page' query param in "
        "the URL, or 1 if not present)",
    )
    args = parser.parse_args()
    download_images(
        args.url,
        args.output,
        designs_only=args.designs_only,
        max_pages=args.max_pages,
        start_page=args.start_page,
    )
