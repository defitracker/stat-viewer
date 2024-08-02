import Matrix from "ml-matrix";

/**
 * Class for storing the result of a linear Regression.
 */
export type LinearResult = {
  /**
   * The observed y values as Matrix.
   */
  endogen: Matrix;

  /**
   * The observed variables as Matrix.
   */
  exogen: Matrix;

  /**
   * The number of observations.
   */
  noOfObservations: number;

  /**
   * Flag indicating if an intercept is present in exogen.
   */
  constantPresent: boolean;

  /**
   * The coefficients of the endogen Variables.
   */
  coefficients: Matrix;

  /**
   * The number of coefficients used for this regression including the intercept.
   */
  noOfCoefficients: number;

  /**
   * Standard error of the coefficients.
   */
  stdErrorOfCoefficients: number[];

  /**
   * tValues of the coefficients.
   */
  tValues: number[];

  /**
   * p test values of the tValues of the coefficients.
   */
  pValues: number[];

  /**
   * The predicted values.
   */
  predicted: number[];

  /**
   *  The residuals.
   */
  residuals: number[];

  /**
   * Variance of the residuals.
   */
  sSquare: number;

  /**
   * R squared. The coefficient of determination.
   */
  rSquared: number;

  /**
   * F-statistic for the regression model.
   */
  fValue: number;

  /**
   * The pValue for the F-statistic.
   */
  pValueOfFValue: number;

  /**
   * Degrees of freedom for the residuals = number of observations - number of coefficients.
   */
  residualDegreesOfFreedom: number;

  /**
   * Degrees of freedom for model = number of coefficients excluding the constant.
   */
  modelDegreesOfFreedom: number;

  /**
   * Squared sum of errors (squared sum of residuals).
   */
  sse: number;

  /**
   * Squared sum of total = squared sum of errors + squared sum of regression.
   */
  sst: number;

  /**
   * Squared sum of regression.
   */
  ssr: number;

  /**
   * Mean squared error.
   */
  mse: number;

  /**
   * The equation of the Regression build from the coefficients.
   */
  regressionEquation: string;
};
