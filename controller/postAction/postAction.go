package postAction

import (
	s "PillarsPhenomVFXWeb/session"
	"PillarsPhenomVFXWeb/storage/postStorage"
	u "PillarsPhenomVFXWeb/utility"
	"encoding/json"
	"fmt"
	"os"

	"io"
	"io/ioutil"
	"net/http"
)

func LoadEdlFile(w http.ResponseWriter, r *http.Request) {
	flag, userCode := s.GetAuthorityCode(w, r, "制片")
	if !flag {
		http.Redirect(w, r, "/404.html", http.StatusFound)
		return
	}

	err := r.ParseMultipartForm(32 << 20)
	if err != nil {
		u.OutputJson(w, 1, "parse upload error!", nil)
		return
	}
	formData := r.MultipartForm
	files := formData.File["files"]
	if len(files) > 0 {
		file, err := files[0].Open()
		defer file.Close()
		if err != nil {
			u.OutputJson(w, 12, "open edl file error!", nil)
			return
		}
		out, err := os.Create("./upload/" + files[0].Filename)
		defer out.Close()
		if err != nil {
			u.OutputJson(w, 13, "create edl file failed!", nil)
			return
		}
		_, err = io.Copy(out, file)
		if err != nil {
			fmt.Println("io failed")
			u.OutputJson(w, 14, "io copy edl file failed!", nil)
		}
		// 解析edl文件得到镜头的信息
		edlShots, err := u.ReadEdl(out.Name())
		if err != nil && err.Error() != "EOF" {
			msg := "解析文件错误:" + err.Error()
			u.OutputJson(w, 15, msg, nil)
			return
		}
		if len(edlShots) == 0 {
			u.OutputJson(w, 16, "edl not find short!", nil)
			return
		}
		projectCode := formData.Value["ProjectCode"][0]
		// 查询镜头关联素材的详细信息
		shots, err := postStorage.EdlShotsToShots(files[0].Filename, projectCode, edlShots)
		if shots == nil || err != nil {
			u.OutputJson(w, 17, "edl not find material!", nil)
			return
		}
		// 保存镜头信息
		err = postStorage.InsertMultipleShot(userCode, projectCode, shots)
		if err != nil {
			u.OutputJson(w, 18, err.Error(), nil)
			return
		}

		u.OutputJson(w, 0, "upload success!", shots)
		return
	}

	//请求没有文件,返回错误信息
	u.OutputJson(w, 204, "not find upload file!", nil)
}

func QueryShotByShotCode(w http.ResponseWriter, r *http.Request) {
	data, err := ioutil.ReadAll(r.Body)
	if err != nil {
		u.OutputJsonLog(w, 1, "Read body failed!", nil, "postAction.QueryShotByShotCode: ioutil.ReadAll(r.Body) failed!")
		return
	}
	var code string
	json.Unmarshal(data, &code)
	shot, err := postStorage.QueryShotByShotCode(&code)
	if shot == nil || err != nil {
		u.OutputJson(w, 12, "Query shot failed!", nil)
		return
	}
	u.OutputJson(w, 0, "Query shot success.", shot)
}

func UpdateShot(w http.ResponseWriter, r *http.Request) {
	flag, userCode := s.GetAuthorityCode(w, r, "制片")
	if !flag {
		http.Redirect(w, r, "/404.html", http.StatusFound)
		return
	}

	data, err := ioutil.ReadAll(r.Body)
	if err != nil {
		u.OutputJsonLog(w, 1, "Read body failed!", nil, "postAction.UpdateShot: ioutil.ReadAll(r.Body) failed!")
		return
	}
	var shot u.Shot
	err = json.Unmarshal(data, &shot)
	if err != nil {
		u.OutputJsonLog(w, 12, err.Error(), nil, "postAction.UpdateShot: json.Unmarshal(data, &shot) failed!")
		return
	}
	// TODO 检查传入字段的有效性
	shot.UserCode = userCode

	err = postStorage.UpdateShot(&shot)
	if err != nil {
		u.OutputJsonLog(w, 13, err.Error(), nil, "postAction.UpdateShot: postStorage.UpdateShot(&shot) failed!")
		return
	}

	u.OutputJson(w, 0, "addshot success.", shot)
}

func AddShot(w http.ResponseWriter, r *http.Request) {
	flag, userCode := s.GetAuthorityCode(w, r, "制片")
	if !flag {
		http.Redirect(w, r, "/404.html", http.StatusFound)
		return
	}

	data, err := ioutil.ReadAll(r.Body)
	if err != nil {
		u.OutputJsonLog(w, 1, "Read body failed!", nil, "postAction.AddShot: ioutil.ReadAll(r.Body) failed!")
		return
	}
	var shot u.Shot
	err = json.Unmarshal(data, &shot)
	if err != nil {
		u.OutputJsonLog(w, 12, err.Error(), nil, "postAction.AddShot: json.Unmarshal(data, &shot) failed!")
		return
	}
	// TODO 检查传入字段的有效性
	shot.ShotCode = *u.GenerateCode(&userCode)
	shot.ShotFlag = "1" // 手动插入镜头的标识
	shot.UserCode = userCode

	err = postStorage.AddSingleShot(&shot)
	if err != nil {
		u.OutputJsonLog(w, 13, err.Error(), nil, "postAction.AddShot: postStorage.AddSingleShot(&shot) failed!")
		return
	}

	u.OutputJson(w, 0, "addshot success.", shot)
}

func ModifyShotName(w http.ResponseWriter, r *http.Request) {
	flag, userCode := s.GetAuthorityCode(w, r, "制片")
	if !flag {
		http.Redirect(w, r, "/404.html", http.StatusFound)
		return
	}

	data, err := ioutil.ReadAll(r.Body)
	if err != nil {
		u.OutputJsonLog(w, 1, "Read body failed!", nil, "postAction.ModifyShotName: ioutil.ReadAll(r.Body) failed!")
		return
	}
	var shot u.Shot
	err = json.Unmarshal(data, &shot)
	if err != nil {
		u.OutputJsonLog(w, 12, err.Error(), nil, "postAction.ModifyShotName: json.Unmarshal(data, &shot) failed!")
		return
	}
	// TODO 检查传入字段的有效性
	shot.UserCode = userCode

	err = postStorage.ModifyShotName(&shot)
	if err != nil {
		u.OutputJsonLog(w, 13, err.Error(), nil, "postAction.ModifyShotName: postStorage.ModifyShotName(&shot) failed!")
		return
	}

	u.OutputJson(w, 0, "ModifyShotName success.", shot)
}

// ---------------------------------------------------------------------

//shotCode
func DeleteShot(w http.ResponseWriter, r *http.Request) {
	data, err := ioutil.ReadAll(r.Body)
	if err != nil {
		u.OutputJson(w, 1, "Read body failed!", nil)
		//pillarsLog.PillarsLogger.Print("ioutil.ReadAll(r.Body) failed!")
		return
	}
	var code string
	json.Unmarshal(data, &code)
	err = postStorage.DeleteSingleShot(&code)
	if err != nil {
		u.OutputJson(w, 2, "Read body failed!", nil)
		//pillarsLog.PillarsLogger.Print("ioutil.ReadAll(r.Body) failed!")
		return
	}
	u.OutputJson(w, 0, "Deleteshot success.", nil)
}

// RECEVE: sourceFile name   RETURN: notes struct  (an Array)
func QueryShotByProjectCode(w http.ResponseWriter, r *http.Request) {
	data, err := ioutil.ReadAll(r.Body)
	if err != nil {
		u.OutputJson(w, 1, "Read body failed!", nil)
		//pillarsLog.PillarsLogger.Print("ioutil.ReadAll(r.Body) failed!")
		return
	}
	var name string
	json.Unmarshal(data, &name)
	result, err := postStorage.QueryShotByProjectCode(&name)
	if err != nil {
		u.OutputJson(w, 2, "Read body failed!", nil)
		//pillarsLog.PillarsLogger.Print("ioutil.ReadAll(r.Body) failed!")
		return
	}
	u.OutputJson(w, 0, "Deleteshot success.", result)
}
