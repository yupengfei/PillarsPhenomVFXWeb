package main

import (
	"PillarsPhenomVFXWeb/action"
	"net/http"
)

func RouterBinding() {
	http.Handle("/", http.StripPrefix("/", http.FileServer(http.Dir("./pages"))))

	http.HandleFunc("/login_action", action.LoginAction)
	http.HandleFunc("/add", action.AddUserAction)
	http.HandleFunc("/userlist", action.UserListAction)
}
