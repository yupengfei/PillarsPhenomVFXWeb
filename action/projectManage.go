package action

import (
	"PillarsPhenomVFXWeb/mysqlStorage"
	u "PillarsPhenomVFXWeb/utility"
	"encoding/json"
	"fmt"
	"html/template"
	"net/http"
	"reflect"
)

func AddProjectAction(w http.ResponseWriter, r *http.Request) {
	if !checkAuthority(w, r, "制片") {
		http.Redirect(w, r, "/404.html", http.StatusFound)
		return
	}

	r.ParseForm()
	olen := len(r.Form["ProjectName"]) + len(r.Form["Picture"]) + len(r.Form["ProjectLeader"]) + len(r.Form["ProjectType"]) + len(r.Form["StartDatetime"]) + len(r.Form["EndDatetime"]) + len(r.Form["ProjectDetail"])
	if olen != 7 {
		u.OutputJson(w, 1, "Error parameter format", nil)
		return
	}

	if len(r.Form["ProjectName"][0]) == 0 {
		u.OutputJson(w, 12, "Error parameter ProjectName", nil)
		return
	}

	if len(r.Form["Picture"][0]) == 0 {
		u.OutputJson(w, 13, "Error parameter Picture", nil)
		return
	}

	if len(r.Form["ProjectLeader"][0]) == 0 {
		u.OutputJson(w, 14, "Error parameter ProjectLeader", nil)
		return
	}

	if len(r.Form["ProjectType"][0]) == 0 {
		u.OutputJson(w, 15, "Error parameter ProjectType", nil)
		return
	}

	if len(r.Form["StartDatetime"][0]) == 0 {
		u.OutputJson(w, 16, "Error parameter StartDatetime", nil)
		return
	}

	if len(r.Form["EndDatetime"][0]) == 0 {
		u.OutputJson(w, 17, "Error parameter EndDatetime", nil)
		return
	}

	if len(r.Form["ProjectDetail"][0]) == 0 {
		u.OutputJson(w, 18, "Error parameter ProjectDetail", nil)
		return
	}

	temp := "insert"
	projectCode := u.GenerateCode(&temp)
	project := u.Project{
		ProjectCode:   *projectCode,
		ProjectName:   r.Form["ProjectName"][0],
		Picture:       r.Form["Picture"][0],
		ProjectLeader: r.Form["ProjectLeader"][0],
		ProjectType:   r.Form["ProjectType"][0],
		StartDatetime: r.Form["StartDatetime"][0],
		EndDatetime:   r.Form["EndDatetime"][0],
		ProjectDetail: r.Form["ProjectDetail"][0],
		Status:        0,
	}
	result, _ := mysqlStorage.InsertIntoProject(&project)
	if result == false {
		u.OutputJson(w, 19, "Insert into project failed!", nil)
		return
	}

	rs, _ := json.Marshal(project)
	u.OutputJson(w, 0, "Add project succeed!", string(rs))
}

func DeleteProjectAction(w http.ResponseWriter, r *http.Request) {
	if !checkAuthority(w, r, "制片") {
		http.Redirect(w, r, "/404.html", http.StatusFound)
		return
	}

	r.ParseForm()
	olen := len(r.Form["ProjectCode"])
	if olen != 1 {
		u.OutputJson(w, 1, "Error parameter format", nil)
		return
	}

	if len(r.Form["ProjectCode"][0]) == 0 {
		u.OutputJson(w, 12, "Error parameter ProjectCode", nil)
		return
	}

	code := r.Form["ProjectCode"][0]
	result, _ := mysqlStorage.DeleteProjectByProjectCode(&code)
	if result == false {
		u.OutputJson(w, 13, "Delete project failed!", nil)
		return
	}

	u.OutputJson(w, 0, "Delete project succeed!", nil)
}

func UpdateProjectAction(w http.ResponseWriter, r *http.Request) {
	if !checkAuthority(w, r, "制片") {
		http.Redirect(w, r, "/404.html", http.StatusFound)
		return
	}

	r.ParseForm()
	olen := len(r.Form["ProjectCode"]) + len(r.Form["ProjectName"]) + len(r.Form["Picture"]) + len(r.Form["ProjectLeader"]) + len(r.Form["ProjectType"]) + len(r.Form["StartDatetime"]) + len(r.Form["EndDatetime"]) + len(r.Form["ProjectDetail"])
	if olen != 8 {
		u.OutputJson(w, 1, "Error parameter format", nil)
		return
	}

	if len(r.Form["ProjectCode"][0]) == 0 {
		u.OutputJson(w, 11, "Error parameter ProjectName", nil)
		return
	}

	if len(r.Form["ProjectName"][0]) == 0 {
		u.OutputJson(w, 12, "Error parameter ProjectName", nil)
		return
	}

	if len(r.Form["Picture"][0]) == 0 {
		u.OutputJson(w, 13, "Error parameter Picture", nil)
		return
	}

	if len(r.Form["ProjectLeader"][0]) == 0 {
		u.OutputJson(w, 14, "Error parameter ProjectLeader", nil)
		return
	}

	if len(r.Form["ProjectType"][0]) == 0 {
		u.OutputJson(w, 15, "Error parameter ProjectType", nil)
		return
	}

	if len(r.Form["StartDatetime"][0]) == 0 {
		u.OutputJson(w, 16, "Error parameter StartDatetime", nil)
		return
	}

	if len(r.Form["EndDatetime"][0]) == 0 {
		u.OutputJson(w, 17, "Error parameter EndDatetime", nil)
		return
	}

	if len(r.Form["ProjectDetail"][0]) == 0 {
		u.OutputJson(w, 18, "Error parameter ProjectDetail", nil)
		return
	}

	project := u.Project{
		ProjectCode:   r.Form["ProjectCode"][0],
		ProjectName:   r.Form["ProjectName"][0],
		Picture:       r.Form["Picture"][0],
		ProjectLeader: r.Form["ProjectLeader"][0],
		ProjectType:   r.Form["ProjectType"][0],
		StartDatetime: r.Form["StartDatetime"][0],
		EndDatetime:   r.Form["EndDatetime"][0],
		ProjectDetail: r.Form["ProjectDetail"][0],
		Status:        0,
	}
	result, _ := mysqlStorage.UpdateProjectByProjectCode(&project)
	if result == false {
		u.OutputJson(w, 16, "Update project failed!", nil)
		return
	}

	rs, _ := json.Marshal(project)
	u.OutputJson(w, 0, "Update project succeed!", string(rs))
}

func QueryProjectAction(w http.ResponseWriter, r *http.Request) {
	if !checkAuthority(w, r, "制片") {
		http.Redirect(w, r, "/404.html", http.StatusFound)
		return
	}

	r.ParseForm()
	olen := len(r.Form["ProjectCode"])
	if olen != 1 {
		u.OutputJson(w, 1, "Error parameter format", nil)
		return
	}

	if len(r.Form["ProjectCode"][0]) == 0 {
		u.OutputJson(w, 12, "Error parameter ProjectCode", nil)
		return
	}
	code := r.Form["ProjectCode"][0]
	project, err := mysqlStorage.QueryProjectByProjectCode(&code)
	if err != nil {
		u.OutputJson(w, 13, "Query project failed!", nil)
		return
	}

	result, _ := json.Marshal(project)
	fmt.Fprintf(w, string(result))
}

func ProjectListAction(w http.ResponseWriter, r *http.Request) {
	if !checkAuthority(w, r, "制片") {
		http.Redirect(w, r, "/404.html", http.StatusFound)
		return
	}

	r.ParseForm()
	page, limit := 1, 20
	olen := len(r.Form["Start"]) + len(r.Form["End"])
	if olen == 2 {
		p := reflect.ValueOf(r.Form["Start"][0])
		fmt.Println("---------->", p.Type())
		//if p.Type() != int {
		//	u.OutputJson(w, 1, "Error parameter Start", nil)
		//	return
		//}

		//l := reflect.ValueOf(r.Form["End"][0])
		//if l.Type() != int {
		//	u.OutputJson(w, 12, "Error parameter End", nil)
		//	return
		//}
		//page, limit = r.Form["Start"][0], r.Form["End"][0]
	}

	list, err := template.ParseFiles("pages/project.gtpl")
	if err != nil {
		panic(err.Error())
	}
	projectList, err := mysqlStorage.QueryProjectList(page, limit)
	if err != nil {
		panic(err.Error())
	}
	list.Execute(w, projectList)
}
