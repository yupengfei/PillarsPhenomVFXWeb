package main

import (
	"PillarsPhenomVFXWeb/controller/editoralAction"
	"PillarsPhenomVFXWeb/controller/loginAction"
	"PillarsPhenomVFXWeb/controller/projectAction"
	"PillarsPhenomVFXWeb/controller/userAction"
	"net/http"
)

func RouterBinding() {
	http.Handle("/", http.StripPrefix("/", http.FileServer(http.Dir("./pages"))))

	http.HandleFunc("/login_action", loginAction.Login)

	http.HandleFunc("/user_add", userAction.AddUser)
	http.HandleFunc("/user_del", userAction.DeleteUser)
	http.HandleFunc("/user_upd", userAction.UpdateUser)
	http.HandleFunc("/user_sel", userAction.QueryUser)
	http.HandleFunc("/user_list", userAction.UserList)

	http.HandleFunc("/project_add", projectAction.AddProject)
	http.HandleFunc("/project_del", projectAction.DeleteProject)
	http.HandleFunc("/project_upd", projectAction.UpdateProject)
	http.HandleFunc("/project_sel", projectAction.QueryProject)
	http.HandleFunc("/project_list", projectAction.ProjectList)
	http.HandleFunc("/project_load", projectAction.LoadProject)

	http.HandleFunc("/editoral_library_add", editoralAction.AddLibrary)
	http.HandleFunc("/editoral_library_materials", editoralAction.GetLibraryFileList)
	// TODO 需要在js里面查看传回的数据格式结构是否正确
	http.HandleFunc("/editoral_material", editoralAction.GetMaterialInfo)
	http.HandleFunc("/editoral_filetype", editoralAction.GetFiletypes)
	// TODO 待实现中的接口
	http.HandleFunc("/editoral_folder_add", editoralAction.AddFolder)
	http.HandleFunc("/editoral_folder_del", editoralAction.GetFiletypes)
	http.HandleFunc("/editoral_folder_upd", editoralAction.GetFiletypes)
	http.HandleFunc("/editoral_folder_addfiles", editoralAction.GetFiletypes)
	http.HandleFunc("/editoral_download_file", editoralAction.GetFiletypes)
	http.HandleFunc("/editoral_download_files", editoralAction.GetFiletypes)
	http.HandleFunc("/editoral_find_files", editoralAction.GetFiletypes)

	//http.HandleFunc("/.*", NotFound) // TODO 想实现未知路由地址访问的404页面跳转
}
