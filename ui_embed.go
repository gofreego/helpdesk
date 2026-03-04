package main

import (
	"embed"
	"io/fs"
	"net/http"
)

//go:embed all:ui/dist
var uiDist embed.FS

func getUIFileSystem() http.FileSystem {
	// Re-map the embedded filesystem to the root of 'dist'
	fsys, err := fs.Sub(uiDist, "ui/dist")
	if err != nil {
		panic(err)
	}
	return http.FS(fsys)
}

func getIndexHTML() []byte {
	data, err := fs.ReadFile(uiDist, "ui/dist/index.html")
	if err != nil {
		panic(err)
	}
	return data
}
