/**
 * Created by John on 2014/8/11.
 */
let request = require('request');
let cheerio = require('cheerio');
let fs = require('fs');
let path = require('path');
let mime = require('mime');
let archiver = require('archiver');

function textRequest (query, req, resq, fileName, time) {
   request(query.url, function (error, res, body) {
      if (!error && res.statusCode == 200) {
          let $ = cheerio.load(body);
          let arr = [];
          let getChilren = (children) => {
            children.forEach((el) => {
                if(el.children && el.children.length > 0) {
                    getChilren(el.children)
                }
                if(el.next && el.next.length > 0) {
                    getChilren(el.next)
                }
                if(el.prev && el.prev.length > 0) {
                    getChilren(el.prev)
                }
                if(el.data && el.data.match("\n") === null) {
                    arr.push(el.data)
                }
            })
          }
          getChilren($._root.children)
          let num = Math.random() * 100000000000000000;
          fs.writeFile(fileName + num + ".txt", arr,  function(err) {
           if (err) {  
               return console.error(err);
           }
            zipFiles(query, req, resq, fileName, time);
          });
      }
  })
}

function imageRequest (query, req, resq, fileName, time) {
  request(query.url, function (error, res, body) {
    if (!error && res.statusCode == 200) {
      let $ = cheerio.load(body);
      let img = $('img');
      img.each(function (el) {
        if(img[el.toString()] && img[el.toString()].attribs && img[el.toString()].attribs.src) {
          let src = img[el.toString()].attribs.src;
          if(src.match("http") !== null) {
            request(src).pipe((fs.createWriteStream(fileName + time + el + '.jpg')));
          }
        }
      })
    }
  })
}

function zipFiles (query, req, resq, fileName, time) {

  let output = fs.createWriteStream('./files/' + query.fileName + time + '.zip');
  let archive = archiver('zip');

  archive.on('error', function(err){
      throw err;
  });
  var dir = path.join(__dirname, "../files");
  archive.pipe(output);
  archive.bulk([
      { 
        cwd:dir,
        src: [query.fileName + time, query.fileName + time + '/**'],
         expand: dir
      }
  ]);
   archive.on('end', function (err){
      downloadReq(query, req, resq, fileName, time)      
  });
  archive.finalize();
}

function downloadReq (query, req, resq, fileName, time) {
  let file = path.join(__dirname, '../files/' + query.fileName + time + ".zip");
  let filename = path.basename(file);
  let mimetype = mime.lookup(file);        //匹配文件格式

  resq.setHeader('Content-disposition', 'attachment; filename=' + filename);
  resq.setHeader('Content-type', mimetype);

  let filestream = fs.createReadStream(file);
  filestream.on('data', function(chunk) {
    resq.write(chunk);
  });
  filestream.on('end', function() {
    resq.end();
    let rmPath = path.join(__dirname, '../files/');
    deleteFolderRecursive(rmPath);
  });
}

function deleteFolderRecursive (path) {
  var files = [];
  if(fs.existsSync(path) && fs.readdirSync(path).length !== 0) {
    files = fs.readdirSync(path);
    files.forEach(function(file,index){
        var curPath = path + "/" + file;
        if(fs.statSync(curPath).isDirectory()) { // recurse
          deleteFolderRecursive(curPath);
        } else { // delete file
          fs.unlinkSync(curPath);
        }
    });
  }
  else {
    fs.rmdirSync(path);
  }
}

let cralwer = {
    getData: (query, req, resq) => {
        let date = new Date();
        let time = date.getTime();
        // let url = 'http://www.ss.pku.edu.cn/index.php/newscenter/news/2391';
        //request(url).pipe((fs.createWriteStream('suren.html')));
        let fileName = "./files/" + query.fileName + time + "/";
        fs.mkdir(fileName, function(err){
            if (err) {
                return console.error(err);
            }
            console.log("目录创建成功。");
        });
        if(query.contentType === "all") {
          imageRequest(query, req, resq, fileName, time);
          textRequest(query, req, resq, fileName, time);
        }
        else if(query.contentType === "image") {
          textRequest(query, req, resq, fileName, time);
        }
        else {
          imageRequest(query, req, resq, fileName, time);
        }
    },
}

module.exports = cralwer;