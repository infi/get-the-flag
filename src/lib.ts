const isMobile = () => navigator.userAgent.includes("iPhone") ||
    navigator.userAgent.includes("Android") ||
    navigator.userAgent.includes("iPad")

const getHeight = () => window.innerHeight
const getWidth = () => window.innerWidth
const getHeightS = () => getHeight().toString()
const getWidthS = () => getWidth().toString()

const hsvToRgb = (h: number, s: number, v: number) => {
    let r
    let g
    let b
    let i
    let f
    let p
    let q
    let t
    if (!s && !v) {
        s = (h as any).s, v = (h as any).v, h = (h as any).h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
    };
}

const componentToHex = (c: number) => {
    const hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

const hsvToHex = (h: number, s: number, v: number) => {
    const rgb = hsvToRgb(h, s, v)
    return rgbToHex(rgb.r, rgb.g, rgb.b)
}

/**
 * Ease function
 * @param x Number between 0 (0%) and 1 (100%)
 */
const easeInOutQuart = (x: number) => {
    return x < 0.5 ? 8 * x * x * x * x : 1 - Math.pow(-2 * x + 2, 4) / 2;
}

export default {
    getHeight, getWidth, getHeightS, getWidthS,
    hsvToRgb, rgbToHex, hsvToHex,
    isMobile,
    easeInOutQuart
}