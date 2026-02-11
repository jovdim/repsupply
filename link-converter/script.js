document.getElementById("convertBtn").addEventListener("click", convertLink);

function extractProductID(url) {
  let match, platform, rawLink;

  if (url.includes("taobao.com/item.") || url.includes("tmall.com")) {
    match = url.match(/id=(\d+)/);
    platform = "taobao";
    rawLink = `https://item.taobao.com/item.htm?id=${match[1]}`;
  } else if (url.includes("weidian.com/item")) {
    match = url.match(/itemID=(\d+)/);
    platform = "weidian";
    rawLink = `https://weidian.com/item.html?itemID=${match[1]}`;
  } else if (url.includes("1688.com/offer")) {
    match = url.match(/offer\/(\d+)\.html/);
    platform = "1688";
    rawLink = `https://detail.1688.com/offer/${match[1]}.html`;
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
    ? { id: match[1], platform: platform, rawLink: rawLink }
    : { id: null, platform: null, rawLink: null };
}

function extractFromAgent(url) {
  let match, platform, id, rawLink;

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
    match = url.match(/productLink=([^&]*)/);
    let decodedLink = decodeURIComponent(match[1]);
    match = decodedLink.match(/itemID=(\d+)/);
    platform = url.includes("taobao")
      ? "taobao"
      : url.includes("1688")
      ? "1688"
      : "weidian";
  } else if (url.includes("allchinabuy.com")) {
    match = url.match(/url=([^&]*)/);
    let decodedLink = decodeURIComponent(match[1]);
    if (decodedLink.includes("weidian.com")) {
      match = decodedLink.match(/(?:itemID|itemId)=(\d+)/);
    } else if (decodedLink.includes("taobao.com")) {
      match = decodedLink.match(/id=(\d+)/);
      platform = "taobao";
    } else if (decodedLink.includes("1688.com")) {
      match = decodedLink.match(/offer\/(\d+)\.html/);
      platform = "1688";
    }
    platform = url.includes("taobao")
      ? "taobao"
      : url.includes("1688")
      ? "1688"
      : "weidian";
  } else if (url.includes("superbuy.com")) {
    let params = new URLSearchParams(url.split("?")[1]);
    let encodedRaw = params.get("url");
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
    match = url.match(/hoobuy\.com\/product\/(\d+)\/(\d+)/);
    let platformCode = match ? match[1] : null;
    id = match ? match[2] : null;
    if (platformCode === "1") platform = "taobao";
    else if (platformCode === "0") platform = "1688";
    else if (platformCode === "2") platform = "weidian";
  } else if (url.includes("oopbuy.com")) {
    match = url.match(/oopbuy\.com\/product\/([^\/]+)\/(\d+)/);
    let indicator = match ? match[1] : null;
    id = match ? match[2] : null;
    if (indicator === "1" || indicator.toLowerCase() === "taobao")
      platform = "taobao";
    else if (indicator === "0" || indicator.toLowerCase() === "1688")
      platform = "1688";
    else if (indicator === "2" || indicator.toLowerCase() === "weidian")
      platform = "weidian";
  } else if (url.includes("kakobuy.com")) {
    let params = new URLSearchParams(url.split("?")[1]);
    let encodedRaw = params.get("url");
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

  return {
    id: id || null,
    platform: platform || null,
    rawLink: rawLink || null,
  };
}

function copyToClipboard(button, text) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      button.innerHTML =
        '<img class="btn-img" src="./images/copy-icons/copied-icon.png" alt="copied icon">';
      setTimeout(() => {
        button.innerHTML =
          '<img class="btn-img" src="./images/copy-icons/copy-icon.png" alt="copy icon">';
      }, 1500);
    })
    .catch((err) => {
      console.error("Failed to copy: ", err);
    });
}

function convertLink() {
  const inputField = document.getElementById("inputLink");
  const resultDiv = document.getElementById("result");
  const inputLink = inputField.value.trim();

  if (!inputLink) {
    alert("Please enter a valid link!");
    return;
  }
  let extracted = extractProductID(inputLink);

  if (!extracted.id) {
    alert("Invalid link! Could not extract product ID.");
    return;
  }

  const { id, platform, rawLink } = extracted;
  const encodedLink = encodeURIComponent(rawLink);

  const affiliateCodes = {
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

  const agents = {
    "Raw Link": {
      link: rawLink,
    },
    AllChinaBuy: {
      link: `https://www.allchinabuy.com/en/page/buy/?from=search-input&url=${encodedLink}${affiliateCodes.AllChinaBuy}`,
      logo: "./images/agent-images/allchinabuy.webp",
    },
    AcBuy: {
      link: `https://www.acbuy.com/product/?id=${id}&source=${
        platform === "taobao" ? "TB" : platform === "1688" ? "AL" : "WD"
      }${affiliateCodes.AcBuy}`,
      logo: "./images/agent-images/acbuy.webp",
    },
    CNFans: {
      link: `https://cnfans.com/product/?shop_type=${
        platform === "taobao"
          ? "taobao"
          : platform === "1688"
          ? "ali_1688"
          : "weidian"
      }&id=${id}${affiliateCodes.CNFans}`,
      logo: "./images/agent-images/cnfans.webp",
    },
    OrientDig: {
      link: `https://orientdig.com/product/?shop_type=${
        platform === "taobao"
          ? "taobao"
          : platform === "1688"
          ? "ali_1688"
          : "weidian"
      }&id=${id}${affiliateCodes.OrientDig}`,
      logo: "./images/agent-images/orientdig.webp",
    },
    Sugargoo: {
      link: `https://www.sugargoo.com/#/home/productDetail?productLink=${encodedLink}${affiliateCodes.Sugargoo}`,
      logo: "./images/agent-images/sugargoo.webp",
    },
    Superbuy: {
      link: `https://www.superbuy.com/en/page/buy?from=search-input&url=${encodedLink}${affiliateCodes.Superbuy}`,
      logo: "./images/agent-images/superbuy.webp",
    },
    Mulebuy: {
      link: `https://mulebuy.com/product/?shop_type=${
        platform === "taobao"
          ? "taobao"
          : platform === "1688"
          ? "ali_1688"
          : "weidian"
      }&id=${id}${affiliateCodes.Mulebuy}`,
      logo: "./images/agent-images/mulebuy.webp",
    },
    Hoobuy: {
      link: `https://www.hoobuy.com/product/${
        platform === "taobao" ? "1" : platform === "1688" ? "0" : "2"
      }/${id}${affiliateCodes.Hoobuy}`,
      logo: "./images/agent-images/hoobuy.webp",
    },
    Oopbuy: {
      link: `https://www.oopbuy.com/product/${
        platform === "taobao"
          ? "1"
          : platform === "1688"
          ? "0"
          : platform === "weidian"
          ? "weidian"
          : "2"
      }/${id}${affiliateCodes.Oopbuy}`,
      logo: "./images/agent-images/oopbuy.webp",
    },
    Kakobuy: {
      link: `https://www.kakobuy.com/item/details?url=${encodedLink}${affiliateCodes.Kakobuy}`,
      logo: "./images/agent-images/kakobuy.webp",
    },
  };

  let listHTML = "<ul>";

  for (const [agentName, agent] of Object.entries(agents)) {
    listHTML += `
    <li>
      <div class="agent-logo-link">
            ${
              agentName === "Raw Link"
                ? '<p class="raw-title">RAW</p>'
                : `<img class="agent-logo" src="${agent.logo}" alt="${agentName} logo">`
            }
        <a href="${agent.link}" target="_blank" class="link-style">${
      agent.link
    }</a>
      </div>
      <button class="copy-btn" onclick="copyToClipboard(this, '${agent.link}')">
        <img class="btn-img" src="./images/copy-icons/copy-icon.png" alt="copy icon">
      </button>
    </li>
  `;
  }

  listHTML += "</ul>";
  resultDiv.innerHTML = listHTML;
}

