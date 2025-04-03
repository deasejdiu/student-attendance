import React from "react";
import {Container ,TextField,Button ,Box,} from '@mui/material';
import {useFormik} from 'formik';
import * as Yup from 'yup';
import {useNavigate} from 'react-router-dom';

function RegisterForm(){
    const navigate = useNavigate()
    const formik = useFormik({
        initialValues: {
            firstName:'',
            lastName:'',
            username:'',
            password:'',
            confirmPassword:'',
        },
        validationSchema:Yup.object({
            firstName:Yup.string().required('Required'),
            lastName:Yup.string().required('Required'),
            username:Yup.string().required('Username is required'),
            password: Yup.string().required('Password is required').min(6, 'Password must be at least 6 characters'),
            confirmPassword: Yup.string()
            .required('Please confirm your password')
            .oneOf([Yup.ref('password'), null], 'Passwords must match'),
        }),
        onSubmit : async (values,{setSubmitting , setErrors}) =>{
            try{
                const response = await fetch('http://localhost:5000/users/register',{
                    method:'POST',
                    headers:{
                        'Content-Type':'application/json',
                    },
                    body:JSON.stringify(values)
                });
                
                const data = await response.json();

                if(!response.ok){
                    throw new Error(data.error || 'Failed to register user');
                }
                navigate ('/login')
                console.log(data.message);
            }catch (error) {
                console.error('Registration error:',error.message);
                setErrors({form :error.message});
            }
            setSubmitting(false);
        },  
});

return (
    <Container maxWidth="xs">
      <Box sx={{ marginTop: 8 }}>
        <form onSubmit={formik.handleSubmit}>
          <TextField
            fullWidth
            id="firstName"
            name="firstName"
            label="First Name"
            variant="outlined"
            margin="normal"
            autoComplete="given-name"
            required
            value={formik.values.firstName}
            onChange={formik.handleChange}
            error={formik.touched.firstName && Boolean(formik.errors.firstName)}
            helperText={formik.touched.firstName && formik.errors.firstName}
          />
          <TextField
            fullWidth
            id="lastName"
            name="lastName"
            label="Last Name"
            variant="outlined"
            margin="normal"
            autoComplete="family-name"
            required
            value={formik.values.lastName}
            onChange={formik.handleChange}
            error={formik.touched.lastName && Boolean(formik.errors.lastName)}
            helperText={formik.touched.lastName && formik.errors.lastName}
          />
          <TextField
            fullWidth
            id="username"
            name="username"
            label="Username"
            variant="outlined"
            margin="normal"
            autoComplete="username"
            required
            value={formik.values.username}
            onChange={formik.handleChange}
            error={formik.touched.username && Boolean(formik.errors.username)}
            helperText={formik.touched.username && formik.errors.username}
          />
          <TextField
            fullWidth
            id="password"
            name="password"
            label="Password"
            type="password"
            variant="outlined"
            margin="normal"
            autoComplete="new-password"
            required
            value={formik.values.password}
            onChange={formik.handleChange}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
          />
          <TextField
            fullWidth
            id="confirmPassword"
            name="confirmPassword"
            label="Confirm Password"
            type="password"
            variant="outlined"
            margin="normal"
            autoComplete="new-password"
            required
            value={formik.values.confirmPassword}
            onChange={formik.handleChange}
            error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
            helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
          />
          <Button type="submit" fullWidth variant="contained" color="primary" sx={{ marginTop: 2 }}>
            Register
          </Button>
        </form>
      </Box>
    </Container>
  );
}

export default RegisterForm;