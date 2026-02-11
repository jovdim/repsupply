// Link converter utility — ported from link-converter/script.js
// All URL patterns and affiliate codes preserved exactly from the original.

export interface ExtractedProduct {
  id: string | null;
  platform: "taobao" | "weidian" | "1688" | null;
  rawLink: string | null;
}

export interface AgentLink {
  name: string;
  link: string;
  logo: string | null; // null for "Raw Link"
}

function extractFromAgent(url: string): ExtractedProduct {
  let match: RegExpMatchArray | null = null;
  let platform: "taobao" | "weidian" | "1688" | null = null;
  let id: string | null = null;
  let rawLink: string | null = null;

  if (url.includes("acbuy.com")) {
    match = url.match(/id=(\d+)/);
    platform = url.includes("source=TB")
      ? "taobao"
      : url.includes("source=AL")
        ? "1688"
        : "weidian";
  } else if (url.includes("cnfans.com")) {
    match = url.match(/id=(\d+)/);
    platform = url.includes("shop_type=taobao")
      ? "taobao"
      : url.includes("shop_type=ali_1688")
        ? "1688"
        : "weidian";
  } else if (url.includes("orientdig.com")) {
    match = url.match(/id=(\d+)/);
    platform = url.includes("shop_type=taobao")
      ? "taobao"
      : url.includes("shop_type=ali_1688")
        ? "1688"
        : "weidian";
  } else if (url.includes("sugargoo.com")) {
    const plMatch = url.match(/productLink=([^&]*)/);
    if (plMatch) {
      const decodedLink = decodeURIComponent(plMatch[1]);
      match = decodedLink.match(/itemID=(\d+)/) || decodedLink.match(/id=(\d+)/);
    }
    platform = url.includes("taobao")
      ? "taobao"
      : url.includes("1688")
        ? "1688"
        : "weidian";
  } else if (url.includes("allchinabuy.com")) {
    const urlMatch = url.match(/url=([^&]*)/);
    if (urlMatch) {
      const decodedLink = decodeURIComponent(urlMatch[1]);
      if (decodedLink.includes("weidian.com")) {
        match = decodedLink.match(/(?:itemID|itemId)=(\d+)/);
      } else if (decodedLink.includes("taobao.com")) {
        match = decodedLink.match(/id=(\d+)/);
      } else if (decodedLink.includes("1688.com")) {
        match = decodedLink.match(/offer\/(\d+)\.html/);
      }
    }
    platform = url.includes("taobao")
      ? "taobao"
      : url.includes("1688")
        ? "1688"
        : "weidian";
  } else if (url.includes("superbuy.com")) {
    const params = new URLSearchParams(url.split("?")[1]);
    const encodedRaw = params.get("url");
    if (encodedRaw) {
      rawLink = decodeURIComponent(encodedRaw);
      if (rawLink.includes("taobao.com")) {
        match = rawLink.match(/id=(\d+)/);
        platform = "taobao";
      } else if (rawLink.includes("weidian.com")) {
        match = rawLink.match(/itemID=(\d+)/);
        platform = "weidian";
      } else if (rawLink.includes("1688.com")) {
        match = rawLink.match(/offer\/(\d+)\.html/);
        platform = "1688";
      }
    }
  } else if (url.includes("mulebuy.com")) {
    match = url.match(/id=(\d+)/);
    if (url.includes("shop_type=taobao")) {
      platform = "taobao";
    } else if (url.includes("shop_type=ali_1688")) {
      platform = "1688";
    } else if (url.includes("shop_type=weidian")) {
      platform = "weidian";
    }
  } else if (url.includes("hoobuy.com")) {
    const hMatch = url.match(/hoobuy\.com\/product\/(\d+)\/(\d+)/);
    if (hMatch) {
      const platformCode = hMatch[1];
      id = hMatch[2];
      if (platformCode === "1") platform = "taobao";
      else if (platformCode === "0") platform = "1688";
      else if (platformCode === "2") platform = "weidian";
    }
  } else if (url.includes("oopbuy.com")) {
    const oMatch = url.match(/oopbuy\.com\/product\/([^/]+)\/(\d+)/);
    if (oMatch) {
      const indicator = oMatch[1];
      id = oMatch[2];
      if (indicator === "1" || indicator.toLowerCase() === "taobao")
        platform = "taobao";
      else if (indicator === "0" || indicator.toLowerCase() === "1688")
        platform = "1688";
      else if (indicator === "2" || indicator.toLowerCase() === "weidian")
        platform = "weidian";
    }
  } else if (url.includes("kakobuy.com")) {
    const params = new URLSearchParams(url.split("?")[1]);
    const encodedRaw = params.get("url");
    if (encodedRaw) {
      rawLink = decodeURIComponent(encodedRaw);
      if (rawLink.includes("taobao.com")) {
        match = rawLink.match(/id=(\d+)/);
        platform = "taobao";
      } else if (rawLink.includes("weidian.com")) {
        match = rawLink.match(/itemID=(\d+)/);
        platform = "weidian";
      } else if (rawLink.includes("1688.com")) {
        match = rawLink.match(/offer\/(\d+)\.html/);
        platform = "1688";
      }
    }
  }

  if (!id && match) id = match[1];
  if (!rawLink && id) {
    if (platform === "taobao")
      rawLink = `https://item.taobao.com/item.htm?id=${id}`;
    else if (platform === "1688")
      rawLink = `https://detail.1688.com/offer/${id}.html`;
    else if (platform === "weidian")
      rawLink = `https://weidian.com/item.html?itemID=${id}`;
  }

  return { id: id || null, platform: platform || null, rawLink: rawLink || null };
}

export function extractProductID(url: string): ExtractedProduct {
  let match: RegExpMatchArray | null = null;
  let platform: "taobao" | "weidian" | "1688" | null = null;
  let rawLink: string | null = null;

  if (url.includes("taobao.com/item.") || url.includes("tmall.com")) {
    match = url.match(/id=(\d+)/);
    platform = "taobao";
    if (match) rawLink = `https://item.taobao.com/item.htm?id=${match[1]}`;
  } else if (url.includes("weidian.com/item")) {
    match = url.match(/itemID=(\d+)/);
    platform = "weidian";
    if (match) rawLink = `https://weidian.com/item.html?itemID=${match[1]}`;
  } else if (url.includes("1688.com/offer")) {
    match = url.match(/offer\/(\d+)\.html/);
    platform = "1688";
    if (match) rawLink = `https://detail.1688.com/offer/${match[1]}.html`;
  } else if (
    url.includes("acbuy.com") ||
    url.includes("cnfans.com") ||
    url.includes("orientdig.com") ||
    url.includes("sugargoo.com") ||
    url.includes("allchinabuy.com") ||
    url.includes("superbuy.com") ||
    url.includes("mulebuy.com") ||
    url.includes("hoobuy.com") ||
    url.includes("oopbuy.com") ||
    url.includes("kakobuy.com")
  ) {
    return extractFromAgent(url);
  }

  return match
    ? { id: match[1], platform, rawLink }
    : { id: null, platform: null, rawLink: null };
}

const affiliateCodes: Record<string, string> = {
  AllChinaBuy: "&partnercode=wrf7xD",
  AcBuy: "&u=9MLILB",
  CNFans: "&ref=71427",
  OrientDig: "&ref=100005658",
  Sugargoo: "&memberId=341947205705269884",
  Superbuy: "&partnercode=wyZt2e",
  Mulebuy: "&ref=200617513",
  Hoobuy: "?utm_source=QX1Ke4G8",
  Oopbuy: "?inviteCode=DWBB8ZQ4U",
  Kakobuy: "&affcode=dxf4z",
};

export function convertLink(inputUrl: string): {
  success: boolean;
  error?: string;
  results?: AgentLink[];
  platform?: string;
} {
  const trimmed = inputUrl.trim();
  if (!trimmed) {
    return { success: false, error: "Please enter a valid link." };
  }

  const extracted = extractProductID(trimmed);
  if (!extracted.id) {
    return { success: false, error: "Invalid link! Could not extract product ID." };
  }

  const { id, platform, rawLink } = extracted;
  if (!rawLink || !platform) {
    return { success: false, error: "Could not determine the platform." };
  }

  const encodedLink = encodeURIComponent(rawLink);

  const shopTypeTaobao =
    platform === "taobao" ? "taobao" : platform === "1688" ? "ali_1688" : "weidian";
  const acbuySource =
    platform === "taobao" ? "TB" : platform === "1688" ? "AL" : "WD";
  const hoobuyCode =
    platform === "taobao" ? "1" : platform === "1688" ? "0" : "2";
  const oopbuyCode =
    platform === "taobao" ? "1" : platform === "1688" ? "0" : "weidian";

  const results: AgentLink[] = [
    {
      name: "Raw Link",
      link: rawLink,
      logo: null,
    },
    {
      name: "AllChinaBuy",
      link: `https://www.allchinabuy.com/en/page/buy/?from=search-input&url=${encodedLink}${affiliateCodes.AllChinaBuy}`,
      logo: "/agent-images/allchinabuy.webp",
    },
    {
      name: "AcBuy",
      link: `https://www.acbuy.com/product/?id=${id}&source=${acbuySource}${affiliateCodes.AcBuy}`,
      logo: "/agent-images/acbuy.webp",
    },
    {
      name: "CNFans",
      link: `https://cnfans.com/product/?shop_type=${shopTypeTaobao}&id=${id}${affiliateCodes.CNFans}`,
      logo: "/agent-images/cnfans.webp",
    },
    {
      name: "OrientDig",
      link: `https://orientdig.com/product/?shop_type=${shopTypeTaobao}&id=${id}${affiliateCodes.OrientDig}`,
      logo: "/agent-images/orientdig.webp",
    },
    {
      name: "Sugargoo",
      link: `https://www.sugargoo.com/#/home/productDetail?productLink=${encodedLink}${affiliateCodes.Sugargoo}`,
      logo: "/agent-images/sugargoo.webp",
    },
    {
      name: "Superbuy",
      link: `https://www.superbuy.com/en/page/buy?from=search-input&url=${encodedLink}${affiliateCodes.Superbuy}`,
      logo: "/agent-images/superbuy.webp",
    },
    {
      name: "Mulebuy",
      link: `https://mulebuy.com/product/?shop_type=${shopTypeTaobao}&id=${id}${affiliateCodes.Mulebuy}`,
      logo: "/agent-images/mulebuy.webp",
    },
    {
      name: "Hoobuy",
      link: `https://www.hoobuy.com/product/${hoobuyCode}/${id}${affiliateCodes.Hoobuy}`,
      logo: "/agent-images/hoobuy.webp",
    },
    {
      name: "Oopbuy",
      link: `https://www.oopbuy.com/product/${oopbuyCode}/${id}${affiliateCodes.Oopbuy}`,
      logo: "/agent-images/oopbuy.webp",
    },
    {
      name: "Kakobuy",
      link: `https://www.kakobuy.com/item/details?url=${encodedLink}${affiliateCodes.Kakobuy}`,
      logo: "/agent-images/kakobuy.webp",
    },
  ];

  return { success: true, results, platform };
}
