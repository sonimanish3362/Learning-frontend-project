"use client";

import { Formik, Form, Field, ErrorMessage } from "formik";
import { useRouter } from "next/navigation";
import * as Yup from "yup";


const initialValues = {
    email: "",
    password: "",
}

const validationSchema = Yup.object().shape({
    email: Yup.string().email("Invalid email").required("Email is required"),
    password: Yup.string().required("Password is required"),
})

const Login = () => {

    const router = useRouter();

    const onSubmit = async (values) => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Login failed"
      );
    }

    console.log(data);
    localStorage.setItem("token", data.token);
    

  } catch (error) {
    console.error("Login error:", error);
  }
};

    return (
        <>
            <div className="flex min-h-screen items-center justify-center">

                <Formik
                    initialValues={initialValues}
                    validationSchema={validationSchema}
                    onSubmit={onSubmit}
                >
                    {({ handleSubmit }) => (
                        <Form
                            onSubmit={handleSubmit}
                            className="flex w-96 flex-col gap-4"
                        >

                            <h1 className="text-2xl font-bold">
                                Login
                            </h1>

                            <Field
                                type="email"
                                name="email"
                                placeholder="Email"
                                className="border rounded p-2"
                            />

                            <ErrorMessage
                                name="email"
                                component="span"
                                className="text-red-500"
                            />

                            <Field
                                type="password"
                                name="password"
                                placeholder="Password"
                                className="border rounded p-2"
                            />

                            <ErrorMessage
                                name="password"
                                component="span"
                                className="text-red-500"
                            />

                            <button
                                type="submit"
                                className="rounded bg-blue-500 px-4 py-2 text-white"
                                onClick={() => router.push("/")}
                            >
                                Login
                            </button>

                        </Form>
                    )}
                </Formik>

            </div>
        </>
    )
}

export default Login