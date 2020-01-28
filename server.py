import os
import SimpleHTTPServer

class SuffixHandler(SimpleHTTPServer.SimpleHTTPRequestHandler):
    """
    Overrides the default request handler to assume a suffixless resource is
    actually an html page of the same name. Thus, http://localhost:8000/foo
    would find foo.html.

    Inspired by:
    https://github.com/clokep/clokep.github.io/blob/source/fake_server.py
    """
    def do_GET(self):
        # print self.path
        # path = self.translate_path(self.path)
        # print path

        self.path = self.path.replace("/blog?/", "/blog.html?/");

        # If the path doesn't exist, assume it's a resource suffixed '.html'.
        # if not os.path.exists(path):
        #     self.path = self.path + '.html'

        # Call the superclass methods to actually serve the page.
        SimpleHTTPServer.SimpleHTTPRequestHandler.do_GET(self)

SimpleHTTPServer.test(SuffixHandler)
