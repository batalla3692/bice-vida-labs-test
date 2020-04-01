const express = require('express');
const axios = require('axios');
const router = express.Router();

/**
 * getClientPolicyDetails() will get employees details from an external
 * REST service, and return it as a promise.
 *
 * @return { Promise }
 */
const getClientPolicyDetails = () => {
  try {
    const policy_details_endpoint = process.env.POLICY_DETAILS_ENDPOINT || 'https://dn8mlk7hdujby.cloudfront.net/interview/insurance/policy';
    return axios.get(policy_details_endpoint);
  } catch (error) {
    throw error;
  }
};

/**
 * calculateClientPolicy() will perform the necessary calculations given
 * an object with policy details, and return them as an object.
 *
 * @param policy_details
 */
const calculateClientPolicy = policy_details => {
  const client_policy = {
    worker_details: [],
    total_company_cost: 0,
    costs_units: 'UF'
  };

  policy_details.policy.workers.forEach(worker => {
    const employee_details = { ...worker };

    if ( worker.age <= 65 ) {
      employee_details.has_coverage = true;

      if (policy_details.policy.has_dental_care) {
        employee_details.total_cost = worker.childs <= 0 ? 0.12 : (worker.childs >= 2 ? 0.248 : 0.195);
      } else {
        employee_details.total_cost = worker.childs <= 0 ? 0.279 : (worker.childs >= 2 ? 0.5599 : 0.4396);
      }

      employee_details.enterprise_cost = Number( (employee_details.total_cost * policy_details.policy.company_percentage / 100).toFixed(4) );
      employee_details.copay_cost = Number( (employee_details.total_cost - employee_details.enterprise_cost).toFixed(4) ) ;
      client_policy.total_company_cost += employee_details.enterprise_cost;
    }
    else {
      employee_details.has_coverage = false;
    }

    client_policy.worker_details.push(employee_details);
  });

  return client_policy;
};

router.get('/policies/calculate', (req, res) => {
  getClientPolicyDetails()
    .then( policy_details_response => {
      res.json( calculateClientPolicy(policy_details_response.data) );
    })
    .catch(error => {
      res.status(500).send({ error: error });
    });
});

module.exports = router;