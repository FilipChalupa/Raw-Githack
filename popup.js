// Based on https://rawcdn.githack.com/neoascetic/rawgithack/1.1.0/rawgithack.js

let targetUrl = undefined
const $form = document.querySelector('#form')
const $inputUrl = $form.querySelector('input')
const $submitButton = $form.querySelector('button')

const TEMPLATES = [
  [
    /^(https?):\/\/gitlab\.com\/([^\/]+.*\/[^\/]+)\/(?:raw|blob)\/(.+?)(?:\?.*)?$/i,
    '$1://gl.githack.com/$2/raw/$3',
  ],
  [
    /^(https?):\/\/bitbucket\.org\/([^\/]+\/[^\/]+)\/(?:raw|src)\/(.+?)(?:\?.*)?$/i,
    '$1://bb.githack.com/$2/raw/$3',
  ],
  [
    /^(https?):\/\/bitbucket\.org\/snippets\/([^\/]+\/[^\/]+)\/revisions\/([^\/\#\?]+)(?:\?[^#]*)?(?:\#file-(.+?))$/i,
    '$1://bb.githack.com/!api/2.0/snippets/$2/$3/files/$4',
  ],
  [
    /^(https?):\/\/bitbucket\.org\/snippets\/([^\/]+\/[^\/\#\?]+)(?:\?[^#]*)?(?:\#file-(.+?))$/i,
    '$1://bb.githack.com/!api/2.0/snippets/$2/HEAD/files/$3',
  ],
  [
    /^(https?):\/\/bitbucket\.org\/\!api\/2.0\/snippets\/([^\/]+\/[^\/]+\/[^\/]+)\/files\/(.+?)(?:\?.*)?$/i,
    '$1://bb.githack.com/!api/2.0/snippets/$2/files/$3',
  ],
  [
    /^(https?):\/\/api\.bitbucket\.org\/2.0\/snippets\/([^\/]+\/[^\/]+\/[^\/]+)\/files\/(.+?)(?:\?.*)?$/i,
    '$1://bb.githack.com/!api/2.0/snippets/$2/files/$3',
  ],
  [
    /^(https?):\/\/(?:cdn\.)?rawgit\.com\/(.+?\/[0-9a-f]+\/raw\/(?:[0-9a-f]+\/)?.+)$/i,
    '$1://gist.githack.com/$2',
  ],
  [
    /^(https?):\/\/(?:cdn\.)?rawgit\.com\/([^\/]+\/[^\/]+\/[^\/]+|[0-9A-Za-z-]+\/[0-9a-f]+\/raw)\/(.+)/i,
    '$1://raw.githack.com/$2/$3',
  ],
  [
    /^(https?):\/\/gitcdn\.(?:xyz|link)\/[^\/]+\/(.+?\/[0-9a-f]+\/raw\/(?:[0-9a-f]+\/)?.+)$/i,
    '$1://gist.githack.com/$2',
  ],
  [
    /^(https?):\/\/gitcdn\.(?:xyz|link)\/[^\/]+\/([^\/]+\/[^\/]+\/[^\/]+|[0-9A-Za-z-]+\/[0-9a-f]+\/raw)\/(.+)/i,
    '$1://raw.githack.com/$2/$3',
  ],
  [
    /^(https?):\/\/raw\.github(?:usercontent)?\.com\/([^\/]+\/[^\/]+\/[^\/]+|[0-9A-Za-z-]+\/[0-9a-f]+\/raw)\/(.+)/i,
    '$1://raw.githack.com/$2/$3',
  ],
  [
    /^(https?):\/\/github\.com\/(.[^\/]+?)\/(.[^\/]+?)\/(?!releases\/)(?:(?:blob|raw)\/)?(.+?\/.+)/i,
    '$1://raw.githack.com/$2/$3/$4',
  ],
  [
    /^(https?):\/\/gist\.github(?:usercontent)?\.com\/(.+?\/[0-9a-f]+\/raw\/(?:[0-9a-f]+\/)?.+)$/i,
    '$1://gist.githack.com/$2',
  ],
]

function formatURL() {
  const url = ($inputUrl.value = decodeURIComponent($inputUrl.value.trim()))

  targetUrl = maybeConvertUrl(url)
  if (targetUrl) {
    $inputUrl.classList.remove('invalid')
    $inputUrl.classList.add('valid')
    $submitButton.disabled = false
  } else {
    $inputUrl.classList.remove('valid')
    $inputUrl.classList.toggle('invalid', url.length)
    $submitButton.disabled = true
  }
}
function maybeConvertUrl(url) {
  for (var i in TEMPLATES) {
    var [pattern, template] = TEMPLATES[i]
    if (pattern.test(url)) {
      return url.replace(pattern, template)
    }
  }
}

$inputUrl.addEventListener('input', formatURL, false)

const tabs = (window.browser ? browser : chrome).tabs

function openUrl(url) {
  // window.open(url, '_blank') does not work in Firefox during auto-open (see below)
  tabs.create({url})
  window.close()
}

$form.addEventListener('submit', function(event) {
  event.preventDefault()
  targetUrl && openUrl(targetUrl)
})
tabs.query({ active: true, currentWindow: true }, tabs => {
  if (tabs.length > 0 && $inputUrl.value.length === 0) {
    const url = tabs[0].url || ''
    const convertedUrl = maybeConvertUrl(url)

    if (convertedUrl && convertedUrl.endsWith('.html')) {
      openUrl(convertedUrl)
    }
  }
})
