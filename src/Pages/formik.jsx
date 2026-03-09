import { useFormik } from 'formik'
import React from 'react'
import * as yup from 'yup'


const Formikk = () => {
  let formik = useFormik({
    initialValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: ""
    },

    onSubmit: (values) => {
      console.log(values);
    },

    validationSchema: yup.object({
      firstName: yup.string().required("first name is required"),
      lastName: yup.string().required("last name is required"),
      email: yup.string().required("email is required").email("invalid email format"),
      password: yup.string().required("password is required").matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
        "Password must contain at least 8 characters, one uppercase, one lowercase, one number and one special case character"
      ),


    })
  })



  console.log(formik.touched);
  return (
    <>
      <input type="text" placeholder='firstName' name='firstName' onChange={formik.handleChange} onBlur={formik.handleBlur} /> <br /> <br />
      {(formik.touched.firstName && formik.errors.firstName) && <small className='text-danger'>{formik.errors.firstName}</small>}
      <input type="text" placeholder='lastName' name='lastName' onChange={formik.handleChange} onBlur={formik.handleBlur} /> <br /> <br />
      {(formik.touched.lastName && formik.errors.lastName) && <small className='text-danger'>{formik.errors.lastName}</small>}

      <input type="text" placeholder='email' name='email' onChange={formik.handleChange} onBlur={formik.handleBlur} /> <br /> <br />

      {(formik.touched.email && formik.errors.email) && <small className='text-danger'>{formik.errors.email}</small>}

      <input type="text" placeholder='password' name='password' onChange={formik.handleChange} onBlur={formik.handleBlur} /> <br /> <br />
      {(formik.touched.password && formik.errors.password) && <small className='text-danger'>{formik.errors.password}</small>}




      <button type='submit' onClick={formik.handleSubmit}>Submit</button>




    </>
  )
}

export default Formikk