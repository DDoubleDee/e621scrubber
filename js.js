const img = document.querySelectorAll("img"),
    vid = document.querySelectorAll("video"),
    but = document.querySelectorAll("button"),
    art = document.querySelector("#artists"),
    tag = document.querySelector("#tags"),
    cnt = document.querySelector("#counter"),
    log = document.querySelector("#login"),
    key = document.querySelector("#api_key"),
    lin = document.querySelector("a")

let items = [],
    counter = 0,
    hcounter = 0,
    page = 1,
    imgppage = 0,
    st,
    nd,
    rd
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
document.querySelector("body").addEventListener("keyup", (ev) => {
    if (ev.key == "ArrowDown") {
        getNextPost(false)
    } else if (ev.key == "ArrowRight") {
        getNextPost(true)
    } else if (ev.key == "ArrowLeft") {
        goBack()
    }
})
function nullCounter() {
    items = []
    counter = 0
}
function loadItems(reload) {
    if (items.length == 0 && imgppage == 0) {
        setTimeout(() => {
            $.getJSON("https://e621.net/posts.json", (data) => {
                imgppage = data.posts.length
            })
        }, 1000)
    }
    $.getJSON("https://e621.net/posts.json?tags=" + tag.value + "&page=" + page, (data) => {
        items = items.concat(data.posts)
        but.forEach(button => {
            button.disabled = false
        })
        if (page == 1) {
            getNextPost(false)
            getNextPost(false)
        }

        if (reload) {
            counter -= 2
            getNextPost(false)
            getNextPost(false)
            getNextPost(false)
            getNextPost(false)
        }
    })
}
function getNextPost(download) {
    let artists = ""
    if (items[counter - 1]) {
        items[counter - 1].tags.artist.forEach(artist => {artists += artist + " "});
        art.innerHTML = "artists: " + artists.slice(0, -1) + ", image num: " + (hcounter + counter - 1) + ", page num: " + page
    }
    artists = ""
    if (items[counter - 2]) {
        items[counter - 2].tags.artist.forEach(artist => {artists += artist + "+"});
    }
    if (download) {
        let item = items[counter - 2]
        $.post("http://localhost/getimg.php", {url: item.file.url, name: (artists + item.id + "." + item.file.ext)}, (data) => {
            let a = document.createElement("a")
            a.href = "data:image/png;base64," + data
            a.download = (artists + item.id + "." + item.file.ext)
            a.click()
            $.post("https://e621.net/posts/" + item.id + "/votes.json", {login: log.value, api_key: key.value, score: 1}, (data) => {
                console.log(data)
            })
        })
    }
    st = counter % 3
    nd = (1 + counter) % 3
    rd = (2 + counter) % 3
    if (items[counter - 1]) {
        lin.href = "https://e621.net/posts/" + items[counter - 1].id
        if (items[counter - 1].file.ext == "webm") {
            img[st].style.display = "none"
            vid[st].style.display = "flex"
        } else {
            vid[st].style.display = "none"
            img[st].style.display = "flex"
        }
    } else {
        img[st].style.display = "flex"
    }
    if (items[counter].file.ext == "webm") {
        vid[nd].style.display = "none"
        img[nd].style.display = "none"
        vid[nd].src = items[counter].file.url
    } else {
        vid[nd].style.display = "none"
        img[nd].style.display = "none"
        img[nd].src = items[counter].file.url
    }
    if (items[(1 + counter)].file.ext == "webm") {
        vid[rd].style.display = "none"
        img[rd].style.display = "none"
        vid[rd].src = items[(1 + counter)].file.url
    } else {
        vid[rd].style.display = "none"
        img[rd].style.display = "none"
        img[rd].src = items[(1 + counter)].file.url
    }
    if (!items[(4 + counter)]) {
        but.forEach(button => {
            button.disabled = true
        })
        page++
        loadItems(false)
    }
    counter++
}
function goBack() {
    if (counter > 2) {
        counter -= 3
        getNextPost(false)
        getNextPost(false)
    }
}
function goTo() {
    but.forEach(button => {
        button.disabled = true
    })
    items = []
    page = 1
    counter = parseInt(cnt.value)
    console.log(imgppage)
    if (imgppage > counter) {
        loadItems()
    } else {
        page = parseInt(counter / imgppage) + 1
        hcounter = imgppage * (page - 1)
        counter -= hcounter
        loadItems(true)
    }
}