/*
 * SPDX-License-Identifier: Apache-2.0
 */

package main

import (
	"encoding/json"
	"fmt"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

// EHRContract contract for managing CRUD for MyAsset
type EHRContract struct {
	contractapi.Contract
}

// MyAssetExists returns true when asset with given ID exists in world state
func (c *EHRContract) MyAssetExists(ctx contractapi.TransactionContextInterface, myAssetID string) (bool, error) {
	data, err := ctx.GetStub().GetState(myAssetID)

	if err != nil {
		return false, err
	}

	return data != nil, nil
}

func (c *EHRContract) CreatePatient(ctx contractapi.TransactionContextInterface, args string) error {
	var patient Patient
	json.Unmarshal([]byte(args), &patient)
	exists, err := c.MyAssetExists(ctx, patient.Name)
	if err != nil {
		return fmt.Errorf("Could not read from world state. %s", err)
	} else if exists {
		return fmt.Errorf("The asset %s already exists", patient.Name)
	}
	patientAsByte, _ := json.Marshal(patient)
	return ctx.GetStub().PutState(patient.Name, patientAsByte)
}

func (c *EHRContract) CreateDoctor(ctx contractapi.TransactionContextInterface, args string) error {
	var doctor Doctor
	json.Unmarshal([]byte(args), &doctor)
	exists, err := c.MyAssetExists(ctx, doctor.Name)
	if err != nil {
		return fmt.Errorf("Could not read from world state. %s", err)
	} else if exists {
		return fmt.Errorf("The asset %s already exists", doctor.Name)
	}
	doctorAsByte, _ := json.Marshal(doctor)
	return ctx.GetStub().PutState(doctor.Name, doctorAsByte)
}

func (c *EHRContract) CreateReport(ctx contractapi.TransactionContextInterface, args string) error {
	var report Report
	json.Unmarshal([]byte(args), &report)
	exists, err := c.MyAssetExists(ctx, report.ReportId)
	if err != nil {
		return fmt.Errorf("Could not read from world state. %s", err)
	} else if exists {
		return fmt.Errorf("The asset %s already exists", report.ReportId)
	}
	report.IsAsked = "0"
	report.IsGiven = "0"

	reportAsByte, _ := json.Marshal(report)
	return ctx.GetStub().PutState(report.ReportId, reportAsByte)
}

func (c *EHRContract) QueryWithQueryString(ctx contractapi.TransactionContextInterface, queryString string) ([]byte, error) {
	fmt.Printf("- QueryWithQueryString queryString:\n%s\n", queryString)
	resultsIterator, err := ctx.GetStub().GetQueryResult(queryString)
	if err != nil {
		return nil, err
	}
	defer resultsIterator.Close()
	buffer, err := constructQueryResponseFromIterator(resultsIterator)
	if err != nil {
		return nil, err
	}
	fmt.Printf("- QueryWithQueryString queryResult:\n%s\n", buffer.String())
	return buffer.Bytes(), nil
}

func (c *EHRContract) QueryByObjectType(ctx contractapi.TransactionContextInterface, objectType string) ([]byte, error) {
	fmt.Printf("- QueryByObjectType objectType:\n%s\n", objectType)
	queryString := fmt.Sprintf("{\"selector\":{\"type\":\"%s\"}}", objectType)
	queryResults, err := c.QueryWithQueryString(ctx, queryString)
	if err != nil {
		return nil, err
	}
	fmt.Printf("- QueryByObjectType queryResult:\n%s\n", queryResults)
	return queryResults, nil
}

func (c *EHRContract) CheckExists(ctx contractapi.TransactionContextInterface, query string) ([]byte, error) {
	fmt.Printf("- CheckExists query:\n%s\n", query)
	queryString := fmt.Sprintf("{\"selector\":{\"name\":\"%s\"}}", query)
	queryResults, err := c.QueryWithQueryString(ctx, queryString)
	if err != nil {
		return nil, err
	}
	fmt.Printf("- CheckExists queryResult:\n%s\n", queryResults)
	return queryResults, nil
}
