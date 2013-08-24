(require 'org)
(require 'org-publish)

;; Define our org project to be exported. Run "M-x org-export X mvm" to
;; export.
;;(setq org-publish-project-alist
(add-to-list 'org-publish-project-alist
             '("org-mvm"
               :base-directory "~/org-jekyll/rootdir/org/" ;; Path to your org files.
               :base-extension "org"
               :publishing-directory "~/org-jekyll/rootdir/" ;; Path to your Jekyll project.
               :recursive t
               :publishing-function org-publish-org-to-html
               :headline-levels 6
               :html-extension "html"
               :exclude "files\\|ltxpng"   ;; regexp
               ;; :body-only t ;; Only export section between &lt;body&gt; &lt;/body&gt; tags
               ;; :section-numbers nil
               ;; :table-of-contents nil
               :auto-sitemap t
               :sitemap-filename "index.org"
               :sitemap-title "Contents of GitHub"
               ))

(add-to-list 'org-publish-project-alist
             '("org-static-mvm"
               :base-directory "~/org-jekyll/rootdir/org/files"
               :base-extension "css\\|js\\|png\\|jpg\\|ico\\|gif\\|pdf\\|mp3\\|flac\\|ogg\\|swf\\|php\\|markdown\\|md\\|html\\|htm\\|sh\\|xml\\|gz\\|bz2\\|vcf\\|zip\\|txt\\|tex\\|otf\\|ttf\\|eot\\|rb\\|yml\\|htaccess\\|gitignore"
               :publishing-directory "~/org-jekyll/rootdir/"
               :recursive t
               :publishing-function org-publish-attachment))

(add-to-list 'org-publish-project-alist
             '("mvm" :components ("org-mvm" "org-static-mvm")))

(provide org-github-config)