package main

type Doctor struct {
	DoctorId  string `json:"doctorId"`
	LicenseId string `json:"licenseId"`
	Name      string `json:"name"`
	Age       string `json:"age"`
	PhNo      string `json:"phNo"`
	Type      string `json:"type" default:"Doctor"`
}

type Patient struct {
	PatientId string `json:"patientId"`
	AdharNo   string `json:"adharNo"`
	Name      string `json:"name"`
	Age       string `json:"age"`
	PhNo      string `json:"phNo"`
	Type      string `json:"type" default:"Patient"`
}

type Report struct {
	ReportId  string `json:"reportId"`
	PatientId string `json:"patientId"`
	IsAsked   string `json:"isAsked"`
	IsGiven   string `json:"isGiven"`
	Report    string `json:"report"`
	Type      string `json:"type" default:"Report"`
}

type Success struct {
	Success string `json:"success"`
}
