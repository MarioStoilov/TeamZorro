using Spring.IO;
using Spring.Social.Dropbox.Api;
using Spring.Social.Dropbox.Connect;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Web;
using System.Web.Http;
using System.Net.Http;
using System.Web.Mvc;
using WebChat.Repositories.SerializableModels;

namespace WebChat.Api.Controllers
{
    public class FilesController : ApiController
    {
        private DropBox appAuth = new DropBox { Value = "rylhmyfwhpfr1q4", Secret = "udw34fp6pj315j4" };
        private DropBox userAuth = new DropBox { Value = "higmkxi48pfhv8jt", Secret = "0wouwudro53wmkz" };
        //private IRepository<Dropbox> data;


        public FilesController()
        {
            //this.data = new DropBoxRepository(
            //    ConfigurationManager.AppSettings["MongoConnectionString"]);
        }


        private string DropboxShareFile(string path, string filename)
        {
            DropboxServiceProvider dropboxServiceProvider =
                new DropboxServiceProvider(this.appAuth.Value, this.appAuth.Secret, AccessLevel.AppFolder);
            IDropbox dropbox = dropboxServiceProvider.GetApi(this.userAuth.Value, this.userAuth.Secret);


            Entry uploadFileEntry = dropbox.UploadFileAsync(
                new FileResource(path), filename).Result;


            var sharedUrl = dropbox.GetMediaLinkAsync(uploadFileEntry.Path).Result;
            return (sharedUrl.Url + "?dl=1"); // we can download the file directly
        }


        [System.Web.Http.HttpPost]
        public HttpResponseMessage Post()
        {
            HttpResponseMessage result = null;
            var httpRequest = HttpContext.Current.Request;
            if (httpRequest.Files.Count > 0)
            {
                var docfiles = new List<string>();
                foreach (string file in httpRequest.Files)
                {
                    var postedFile = httpRequest.Files[file];
                    var filePath = HttpContext.Current.Server.MapPath("~/App_Data/" + postedFile.FileName);
                    postedFile.SaveAs(filePath);


                    docfiles.Add(DropboxShareFile(filePath, postedFile.FileName));
                }
                result = Request.CreateResponse(HttpStatusCode.Created, docfiles);
            }
            else
            {
                result = Request.CreateResponse(HttpStatusCode.BadRequest);
            }
            return result;
        }

    }
}