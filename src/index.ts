import lib from "./lib"
import _ from "lodash"

const x = document.getElementById("x")
const ctx: CanvasRenderingContext2D = (x as any).getContext("2d")

const PADDING = 20
const DEBUG_OUTPUT = new URLSearchParams(window.location.search).has("debug")

let playerstate = {
    x: Math.floor(Math.random() * lib.getWidth()),
    y: Math.floor(Math.random() * lib.getHeight()),
    hue: 100,
    em: false,
    emRadius: 50,
    moved: false,
    speed: 3
}

let flagstate = {
    x: Math.floor(Math.random() * lib.getWidth()),
    y: Math.floor(Math.random() * lib.getHeight()),
    hue: 0,
    gotTimes: 0
}

let up = false
let down = false
let left = false
let right = false

let auto = false

const drawScore = () => {
    const oldBaseline = ctx.textBaseline
    ctx.textBaseline = "top"
    ctx.fillStyle = "#ffffff50"
    ctx.font = "normal 700 2rem Chakra Petch"
    ctx.fillText("Score: " + flagstate.gotTimes, PADDING + 5, PADDING + 5)
    ctx.textBaseline = oldBaseline
}

const drawBg = () => {
    ctx.fillStyle = "#212121"
    ctx.fillRect(PADDING, PADDING, lib.getWidth() - (PADDING * 2), lib.getHeight() - (PADDING * 2))
}

const drawPlayer = () => {
    ctx.beginPath()
    const oldBaseline = ctx.textBaseline
    ctx.textBaseline = "top"
    ctx.font = "normal 700 1.5rem Chakra Petch"
    if (playerstate.em) { // if emphasized (first 500ms of a game, to quickly find yourself on the map)
        ctx.fillStyle = "#ff0000"
        ctx.arc(playerstate.x, playerstate.y, playerstate.emRadius, 0, 2 * Math.PI)
        ctx.fillText("You", playerstate.x + playerstate.emRadius + .5, playerstate.y + playerstate.emRadius + .5)
    } else {
        ctx.fillStyle = lib.hsvToHex(playerstate.hue, .25, 1)
        ctx.arc(playerstate.x, playerstate.y, 10, 0, 2 * Math.PI)
        ctx.fillText("You", playerstate.x + 10, playerstate.y + 10)
    }
    ctx.fill()
    ctx.textBaseline = oldBaseline
}

const drawFlag = () => {
    const flagHint = "This is the flag. Capture it!"
    ctx.beginPath()
    ctx.fillStyle = lib.hsvToHex(flagstate.hue, 1, 1) // rainbow
    ctx.arc(flagstate.x, flagstate.y, 10, 0, 2 * Math.PI) // draw the flag circle
    const oldBaseline = ctx.textBaseline
    ctx.textBaseline = "top"
    ctx.font = "normal 700 1.5rem Chakra Petch"
    const measured = ctx.measureText(flagHint)
    if ((flagstate.x + measured.width + 10) > lib.getWidth() - PADDING && flagstate.gotTimes === 0) {
        ctx.textAlign = "right"
        ctx.fillStyle = "#eeeeee"
        ctx.fillRect(flagstate.x - measured.width - 12.5, flagstate.y + 8, measured.width + 5, 27.5)
        ctx.fillStyle = lib.hsvToHex(flagstate.hue, 1, .7)
        ctx.fillText(flagHint, flagstate.x - 10, flagstate.y + 10)
        ctx.textAlign = "left"
    } else if (flagstate.gotTimes === 0) {
        ctx.fillStyle = "#eeeeee"
        ctx.fillRect(flagstate.x + 12.5, flagstate.y + 8, measured.width + 5, 27.5)
        ctx.fillStyle = lib.hsvToHex(flagstate.hue, 1, .7)
        ctx.fillText(flagHint, flagstate.x + 15, flagstate.y + 10)
    }
    ctx.textBaseline = oldBaseline
    ctx.fillStyle = lib.hsvToHex(flagstate.hue, 1, 1)
    ctx.fill() // draw the arc / circle
}

const drawDebug = () => {
    const oldBaseline = ctx.textBaseline
    ctx.textBaseline = "top"
    ctx.textAlign = "right"
    ctx.fillStyle = "#ffffff50"
    ctx.font = "normal 400 1rem monospace"
    const debugPs = JSON.parse(JSON.stringify(playerstate))
    delete debugPs.hue
    delete debugPs.emRadius

    debugPs.up = up
    debugPs.down = down
    debugPs.left = left
    debugPs.right = right

    ctx.fillText(JSON.stringify(debugPs), lib.getWidth() - (PADDING + 5), PADDING + 5)
    ctx.textAlign = "left"
    ctx.fillText("Debug Mode may slow down your game slightly", PADDING + 5, PADDING + 35)
    ctx.textBaseline = oldBaseline
}

const drawHint = () => {
    if (playerstate.moved && flagstate.gotTimes >= 1) return

    const hintText = playerstate.moved ? "The more flags you get, the faster you move." : "Move with the arrow keys or WASD"
    const measured = ctx.measureText(hintText)
    ctx.fillStyle = "#eeeeee"
    ctx.fillRect(PADDING + 7.5, lib.getHeight() - PADDING - 35, measured.width + 5, 27.5)
    ctx.fillStyle = lib.hsvToHex(flagstate.hue, 1, .7)
    ctx.font = "normal 700 1.5rem Chakra Petch"
    ctx.fillText(hintText, PADDING + 10, lib.getHeight() - PADDING - 15)
}

// Code for mobile gamepad buttons, which are coming at some later point. Unused
const mkUp = (x: boolean) => up = !!x
const mkDown = (x: boolean) => down = !!x
const mkLeft = (x: boolean) => left = !!x
const mkRight = (x: boolean) => right = !!x

window.onkeydown = (e) => {
    playerstate.moved = true
    switch (e.key) {
        case "ArrowUp":
        case "w":
            return up = true
        case "ArrowDown":
        case "s":
            return down = true
        case "ArrowLeft":
        case "a":
            return left = true
        case "ArrowRight":
        case "d":
            return right = true
    }
}

window.onkeyup = (e) => {
    switch (e.key) {
        case "ArrowUp":
        case "w":
            return up = false
        case "ArrowDown":
        case "s":
            return down = false
        case "ArrowLeft":
        case "a":
            return left = false
        case "ArrowRight":
        case "d":
            return right = false
        case "z":
            return auto = true
    }
}

window.onload = () => {
    playerstate.em = true
    setTimeout(() => {
        playerstate.em = false
    }, 500)
}

const frame = () => {
    x.setAttribute("width", lib.getWidthS())
    x.setAttribute("height", lib.getHeightS())

    playerstate.hue += .005
    if (playerstate.hue >= 1) playerstate.hue = 0

    flagstate.hue += .01
    if (flagstate.hue >= 1) flagstate.hue = 0

    drawBg()
    drawScore()
    drawPlayer()
    drawFlag()
    drawHint()
    if (DEBUG_OUTPUT) drawDebug()

    if (_.inRange(playerstate.y, flagstate.y - 30, flagstate.y + 30)
        && _.inRange(playerstate.x, flagstate.x - 30, flagstate.x + 30)) {
        flagstate.gotTimes++
        flagstate.x = Math.floor(Math.random() * lib.getWidth())
        flagstate.y = Math.floor(Math.random() * lib.getHeight())

        playerstate.speed += 1
    }

    if (up && playerstate.y !== 0) playerstate.y -= 2 * playerstate.speed
    if (down && playerstate.y !== lib.getHeight()) playerstate.y += 2 * playerstate.speed
    if (left && playerstate.x !== 0) playerstate.x -= 2 * playerstate.speed
    if (right && playerstate.x !== lib.getWidth()) playerstate.x += 2 * playerstate.speed

    if (playerstate.y < PADDING) playerstate.y = PADDING
    if (playerstate.x < PADDING) playerstate.x = PADDING
    if (playerstate.x > lib.getWidth() - PADDING) playerstate.x = lib.getWidth() - PADDING
    if (playerstate.y > lib.getHeight() - PADDING) playerstate.y = lib.getHeight() - PADDING

    if (flagstate.y < PADDING) flagstate.y = PADDING
    if (flagstate.x < PADDING) flagstate.x = PADDING
    if (flagstate.x > lib.getWidth() - PADDING) flagstate.x = lib.getWidth() - PADDING
    if (flagstate.y > lib.getHeight() - PADDING) flagstate.y = lib.getHeight() - PADDING

    if (auto) {
        if (flagstate.y > playerstate.y) playerstate.y += 30
        if (flagstate.y < playerstate.y) playerstate.y -= 30
        if (flagstate.x > playerstate.x) playerstate.x += 30
        if (flagstate.x < playerstate.x) playerstate.x -= 30
    }

    if (playerstate.em) playerstate.emRadius -= 1.7
    if (playerstate.emRadius < 5) playerstate.emRadius = 5

    requestAnimationFrame(frame)
}

frame()