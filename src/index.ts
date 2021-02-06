import lib from "./lib"
import _ from "lodash"

const x = document.getElementById("x")
const ctx: CanvasRenderingContext2D = (x as any).getContext("2d")

const PADDING = 20
const DEBUG_OUTPUT = new URLSearchParams(window.location.search).has("debug")

let hideAutoHint = false

let playerstate = {
    x: Math.floor(Math.random() * lib.getWidth()),
    y: Math.floor(Math.random() * lib.getHeight()),
    hue: 100,
    em: false,
    emRadius: 50,
    moved: false,
    speed: 3,
    auto: false
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

const drawScore = () => {
    const oldBaseline = ctx.textBaseline
    const oldAlign = ctx.textAlign

    ctx.textAlign = "center"
    ctx.textBaseline = "top" // Easy mode text alignment for the top edge

    ctx.fillStyle = lib.hsvToHex(playerstate.hue, .4, 1)
    ctx.font = "normal 700 1.5rem Chakra Petch"

    let xPos = lib.getWidth() / 2
    if (DEBUG_OUTPUT) {
        // If debug mode is on, move the score to top left rather than top center to make space for the player state
        xPos = PADDING + 5
        ctx.textAlign = "left"
    }

    ctx.fillText("Score: " + flagstate.gotTimes, xPos, PADDING + 5)

    ctx.textBaseline = oldBaseline
    ctx.textAlign = oldAlign
}

const drawBg = () => {
    ctx.fillStyle = "#23252c"
    ctx.fillRect(PADDING, PADDING, lib.getWidth() - (PADDING * 2), lib.getHeight() - (PADDING * 2))
}

const drawPlayer = () => {
    ctx.beginPath()
    const oldBaseline = ctx.textBaseline
    ctx.textBaseline = "top"
    ctx.font = "normal 700 1.5rem Chakra Petch"
    if (playerstate.em) {
        // If emphasized (first 500ms of a game, to quickly find yourself on the map)
        const easedRadius = playerstate.emRadius
        ctx.fillStyle = "#ff0000"
        ctx.arc(playerstate.x, playerstate.y, easedRadius, 0, 2 * Math.PI)
        ctx.fillText("You", playerstate.x + easedRadius + .5, playerstate.y + easedRadius + .5)
    } else {
        ctx.fillStyle = lib.hsvToHex(playerstate.hue, .25, 1)
        ctx.arc(playerstate.x, playerstate.y, 10, 0, 2 * Math.PI)
        if (flagstate.gotTimes < 1) ctx.fillText("You", playerstate.x + 10, playerstate.y + 10)
    }
    ctx.fill()
    ctx.textBaseline = oldBaseline
}

const drawFlag = () => {
    const flagHint = "This is the flag. Capture it!"
    ctx.beginPath()
    ctx.fillStyle = lib.hsvToHex(flagstate.hue, 1, 1)
    ctx.arc(flagstate.x, flagstate.y, 10, 0, 2 * Math.PI) // Draw the flag circle
    const oldBaseline = ctx.textBaseline
    ctx.textBaseline = "top"
    ctx.font = "normal 700 1.5rem Chakra Petch"
    const measured = ctx.measureText(flagHint)
    if ((flagstate.x + measured.width + 10) > lib.getWidth() - PADDING && flagstate.gotTimes === 0) {
        ctx.textAlign = "right"
        ctx.fillStyle = lib.hsvToHex(flagstate.hue, 1, .7)
        ctx.fillText(flagHint, flagstate.x - 10, flagstate.y + 10)
        ctx.textAlign = "left"
    } else if (flagstate.gotTimes === 0) {
        ctx.fillStyle = lib.hsvToHex(flagstate.hue, 1, .7)
        ctx.fillText(flagHint, flagstate.x + 15, flagstate.y + 10)
    }
    ctx.textBaseline = oldBaseline
    ctx.fillStyle = lib.hsvToHex(flagstate.hue, 1, 1)
    ctx.fill() // Draw the arc / circle
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
    ctx.fillText("Debug Mode may slow down your game slightly", lib.getWidth() - (PADDING + 5), PADDING + 20)
    ctx.textAlign = "left"
    ctx.textBaseline = oldBaseline
}

const drawHint = () => {
    if (playerstate.moved && flagstate.gotTimes >= 1) return

    const hintText = playerstate.moved ? "The more flags you get, the faster you move" : "Move with the arrow keys or WASD"
    ctx.fillStyle = lib.hsvToHex(playerstate.hue, .4, 1)
    ctx.font = "normal 700 1.5rem Chakra Petch"
    ctx.fillText(hintText, PADDING + 10, lib.getHeight() - PADDING - 15)
}

const drawAutoNotice = () => {
    if (!playerstate.auto || hideAutoHint) return

    const autoText = "Auto mode"
    const autoTextKeys = "Press U to hide"
    ctx.fillStyle = lib.hsvToHex(playerstate.hue, .4, 1)
    ctx.textAlign = "center"
    ctx.font = "normal 700 1.5rem Chakra Petch"
    ctx.fillText(autoText, lib.getWidth() / 2, lib.getHeight() - PADDING - 15)
    ctx.font = "normal 700 1rem Chakra Petch"
    ctx.fillText(autoTextKeys, lib.getWidth() / 2, lib.getHeight() - PADDING)
}

// Code for mobile gamepad buttons, which are coming at some later point. Unused
const mkUp = (x: boolean) => up = !!x
const mkDown = (x: boolean) => down = !!x
const mkLeft = (x: boolean) => left = !!x
const mkRight = (x: boolean) => right = !!x

window.onkeydown = (e) => {
    playerstate.moved = true
    switch (e.key.toLowerCase()) {
        case "arrowup":
        case "w":
            return up = true
        case "arrowdown":
        case "s":
            return down = true
        case "arrowleft":
        case "a":
            return left = true
        case "arrowright":
        case "d":
            return right = true
    }
}

window.onkeyup = (e) => {
    switch (e.key.toLowerCase()) {
        case "arrowup":
        case "w":
            return up = false
        case "arrowdown":
        case "s":
            return down = false
        case "arrowleft":
        case "a":
            return left = false
        case "arrowright":
        case "d":
            return right = false
        case "z":
            return playerstate.auto = true
        case "u":
            return hideAutoHint = true
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
    drawAutoNotice()
    if (DEBUG_OUTPUT) drawDebug()

    const halfPlayerSpeed = playerstate.speed / 2

    if (_.inRange(playerstate.y, flagstate.y - 30 - halfPlayerSpeed, flagstate.y + 30 + halfPlayerSpeed)
        && _.inRange(playerstate.x, flagstate.x - 30 - halfPlayerSpeed, flagstate.x + 30 + halfPlayerSpeed)) {
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

    if (playerstate.auto) {
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