package postStorage

import (
	"PillarsPhenomVFXWeb/mysqlUtility"
	"PillarsPhenomVFXWeb/utility"
)

func AddDemand(d *utility.ShotDemand) error {
	stmt, err := mysqlUtility.DBConn.Prepare("INSERT INTO `shot_demand`(demand_code, shot_code, project_code, picture, demand_detail, demand_level, user_code, status, insert_datetime, update_datetime) VALUE(?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())")
	if err != nil {
		return err
	}
	defer stmt.Close()
	_, err = stmt.Exec(d.DemandCode, d.ShotCode, d.ProjectCode, d.Picture, d.DemandDetail, d.DemandLevel, d.UserCode, d.Status)
	if err != nil {
		return err
	}
	return nil
}

func DeleteDemand(d *utility.ShotDemand) error {
	stmt, err := mysqlUtility.DBConn.Prepare("UPDATE `shot_demand` SET status = 1, user_code = ?, update_datetime = NOW() WHERE demand_code = ?")
	defer stmt.Close()
	if err != nil {
		return err
	}
	_, err = stmt.Exec(d.UserCode, d.DemandCode)
	if err != nil {
		return err
	}
	return nil
}

func UpdateDemand(d *utility.ShotDemand) error {
	stmt, err := mysqlUtility.DBConn.Prepare("UPDATE shot_demand SET picture = ?, demand_detail = ?, demand_level = ?, user_code = ?, update_datetime = NOW() WHERE demand_code = ?")
	if err != nil {
		return err
	}
	defer stmt.Close()
	_, err = stmt.Exec(d.Picture, d.DemandDetail, d.DemandLevel, d.UserCode, d.DemandCode)
	if err != nil {
		return err
	}
	return nil
}

func QueryDemands(code *string) (*[]utility.ShotDemand, error) {
	stmt, err := mysqlUtility.DBConn.Prepare("SELECT demand_code, picture, demand_detail, demand_level FROM shot_demand WHERE status = 0 AND shot_code = ?")
	if err != nil {
		return nil, err
	}
	defer stmt.Close()
	result, err := stmt.Query(code)
	if err != nil {
		return nil, err
	}
	defer result.Close()
	var demands []utility.ShotDemand
	for result.Next() {
		var sd utility.ShotDemand
		err = result.Scan(&sd.DemandCode, &sd.Picture, &sd.DemandDetail, &sd.DemandLevel)
		if err != nil {
			return nil, err
		}
		demands = append(demands, sd)
	}
	return &demands, nil
}
