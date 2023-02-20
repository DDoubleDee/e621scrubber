const tag = document.querySelector("#tags"),
    ipage = document.querySelector("#page"),
    log = document.querySelector("#login"),
    key = document.querySelector("#api_key"),
    template = document.querySelector("#post"),
    max = document.querySelector("#max"),
    main = document.querySelector("main"),
    but = document.querySelectorAll("button"),
    mimg = max.querySelector("img"),
    mvideo = max.querySelector("video"),
    msource = max.querySelector("source")

tag.value = window.localStorage.getItem("tags") || ""
tag.addEventListener("keyup", (ev) => {
    window.localStorage.setItem("tags", tag.value)
})
key.value = window.localStorage.getItem("api_key") || ""
key.addEventListener("keyup", (ev) => {
    window.localStorage.setItem("api_key", key.value)
})
log.value = window.localStorage.getItem("login") || ""
log.addEventListener("keyup", (ev) => {
    window.localStorage.setItem("login", log.value)
})

let page = parseInt(ipage.value || "1"),
    loaded = true

function download(ev) {
    let item = ev.target,
        id = item.getAttribute("id"),
        ext = item.getAttribute("ext"),
        artists = item.getAttribute("artists")
    $.post(window.location.protocol + "//" + window.location.host + "/getimg.php", { url: item.getAttribute("url"), name: (artists + id + "." + ext) }, (data) => {
        let a = document.createElement("a")
        a.href = "data:image/png;base64," + data
        a.download = (artists + id + "." + ext)
        a.click()
        $.post("https://e621.net/posts/" + id + "/votes.json", { login: log.value, api_key: key.value, score: 1, no_unvote: true }, (data) => {
            console.log(data)
        })
    })
}

function minimize(ev) {
    if (ev.target == max) {
        mvideo.style.display = "none"
        mimg.style.display = "none"
        max.style.display = "none"
    }
}

function maximize(ev) {
    let item = ev.target
    max.style.display = "flex"
    if (item.getAttribute("ext") == "webm") {
        mvideo.style.display = "block"
        mvideo.src = item.getAttribute("url")
    } else {
        mimg.style.display = "block"
        mimg.src = item.getAttribute("url")
    }
}

function load() {
    loaded = false
    $.getJSON("https://e621.net/posts.json?tags=" + tag.value + "&page=" + page, (data) => {
        data.posts.forEach(post => {
            let clone = template.content.cloneNode(true),
                artists = "",
                ext = post.file.ext,
                but = clone.querySelector("button"),
                img = clone.querySelector("img")
            post.tags.artist.forEach(artist => { artists += artist + " " })
            if (ext == "webm") {
                let span = clone.querySelector(".video")
                img.src = post.preview.url
                span.setAttribute("url", post.file.url)
                span.setAttribute("ext", ext)
                span.style.display = "flex"
            } else {
                img.src = post.preview.url
                img.setAttribute("ext", ext)
                img.setAttribute("url", post.file.url)
            }
            but.setAttribute("ext", ext)
            but.setAttribute("id", post.id)
            but.setAttribute("artists", artists)
            but.setAttribute("url", post.file.url)
            clone.querySelector(".artists").innerText = artists
            clone.querySelector("a").href = "https://e621.net/posts/" + post.id
            main.append(clone)
            loaded = true
        })
    })
}

function more() {
    page++
    if (loaded) {
        load()
    }
}

function start(ev) {
    ev.target.setAttribute("disabled", true)
    main.addEventListener("scroll", () => {
        if(main.scrollTop > (main.scrollHeight - main.offsetHeight - 1)) {
            more()
        }
    })
    page = parseInt(ipage.value || "1")
    load()
}