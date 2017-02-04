
const {env} = require('jsdom')

exports.getJSON = (arr) => {
  return JSON.stringify(arr, true, 2)
}

exports.getCSV = (arr) => {
  const sep = ','
  const keys = Object.keys(arr[0])

  function line (obj) {
    return keys
      .map((k) => `"${obj[k]}"`)
      .join(sep)
  }

  return [keys.join(sep)]
    .concat(arr.map(line))
    .join('\n')
}

exports.getHTML = (certs) => {
  const keys = Object.keys(certs[0])
  return `
    <html>
      <head>
        <title>RESO Certificates</title>
        <style>
          body {
            font-family: -apple-system, 'Segoe UI', Helvetica, Arial, sans-serif;
            font-size: 18px;
            line-height: 1.4em;
            color: #333;
            margin: 0;
            padding: 0;
          }
          header {
            padding: 3em 2em;
            background: rgb(255, 39, 79);
            color: white;
          }
          footer {
            padding: 3em;
            color: #eee;
            text-align: center;
          }
          header a,
          header a:visited,
          header a:active {
            font-weight: bold;
            color: white;
          }
          header a:hover {
            text-decoration: none;
            background: white;
            color: rgb(255, 39, 79);
            padding: 3px;
            margin: -3px;
          }
          table {
            border-collapse: collapse;
            font-size: 0.67em;
            margin: 3em 2em;
          }
          table thead th {
            border-bottom: 2px solid #999;
          }
          table tbody td {
            border-top: 1px solid #eee;
          }
          table td, table th {
            padding: .5em;
            text-align: left;
          }
        </style>
      </head>
      <body>
        <header>
          <h1>RESO Certificates</h1>
          <p>
            This is a table-formatted version of the
            <a href="http://www.reso.org/certificates/">official list of RESO Certificates</a>.
          </p>
          <p>
            Download <a href="/json">json</a>, <a href="/csv">csv</a>.
          </p>
        </header>
        <table>
          <thead>
            <tr>
              ${keys.map((k) => `<th>${k}</th>`).join('')}
            </tr>
          </thead>
          <tbody>${certs.map((cert) => `
              <tr>${keys.map((k) => `
                <td>${cert[k]}</td>`).join('')}
              </tr>`).join('')}
          </tbody>
        </table>
        <footer>❖</footer>
      </body>
    </html>`
}

exports.getCertificates = (cb) => {
  env('http://www.reso.org/certificates', (err, w) => {
    if (err) return cb(err)
    const certs = Array
      .from(w.document.querySelectorAll('ul.cert_list li'))
      .map((el, i) => {
        const vals = Array
          .from(el.querySelectorAll('h2:nth-of-type(1), h4:nth-of-type(1), p'))
          .map((el) => sanitize(el.textContent))
        const level = (el.querySelector('.cert_level img') || {title: ''}).title
          .replace(/Certification (Level|Version) - /, '')
        const details = sanitize((el.querySelector('.c_details p') || {textContent: ''}).textContent)
        return {
          organization: vals[0],
          status: vals[1],
          duration: vals[2],
          productName: vals[3],
          type: vals[4],
          version: vals[5],
          level,
          details
        }
      })
    cb(null, certs)
  })
}

function sanitize (str) {
  return str
    .replace(/\s/g, ' ')
    .replace(/"/g, '')
    .trim()
}
