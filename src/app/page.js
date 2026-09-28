"use client"
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useState, useEffect, useRef } from "react";
import * as Yup from "yup";

const initialValues = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  department: "",
  salary: "",
  image: null,
};



const validationSchema = Yup.object().shape({
  first_name: Yup.string().required("First name is required"),
  last_name: Yup.string().required("Last name is required"),
  email: Yup.string().email("Invalid email").required("Email is required"),
  phone: Yup.string().required("Phone number is required"),
  department: Yup.string().required("Department is required"),
  salary: Yup.number().required("Salary is required").positive("Salary must be positive"),
})
export default function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [employees, setEmployees] = useState([{}]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(5);
  const [sortBy, setSortBy] = useState("id");
  const [order, setOrder] = useState("asc");
  const [pagination, setPagination] = useState({});
  const [editingId, setEditingId] = useState(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const fileInputRef = useRef(null);

  // useEffect(() => {
  //   getEmployees();
  // }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => {
      clearTimeout(timer)
    }
  }, [search]);

  useEffect(() => {
    fetchEmployees();
  }, [debouncedSearch, page, limit, sortBy, order]);

  const handlelogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }
  const getEmployees = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employees`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

      if (!res.ok) {
        throw new Error("Failed to fetch employees");
      }

      const data = await res.json();
      setEmployees(data);
    } catch (error) {
      console.error("Error fetching employees:", error);
      setError(error.message);
    }
    finally {
      setLoading(false);
    }
  }

  const handleSort = (column) => {
    if (sortBy === column) {
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setOrder("asc");
    }
    setPage(1);
  }

  const getSortIcon = (column) => {
    if (sortBy !== column) {
      return ""
    }

    return order === "asc" ? "▲" : "▼";
  }

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError("");
      const token = localStorage.getItem("token")
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employees?search=${debouncedSearch}&page=${page}&limit=${limit}&sortBy=${sortBy}&order=${order}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }
      )
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to fetch employees");
      }
      setEmployees(data.data);
       (data.pagination);

    } catch (err) {
      console.log(err);
      setError(err.message);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  }

  const editingEmployee = employees.find((emp) => emp.id === editingId);

  const onSubmit = async (values, { resetForm }) => {
    try {

      const token = localStorage.getItem("token");
     
      const url = editingId ? `${process.env.NEXT_PUBLIC_API_URL}/employees/${editingId}` : `${process.env.NEXT_PUBLIC_API_URL}/employees`;

       const method = editingId ? "PUT" : "POST";

        console.log("EDITING ID:", editingId);
        console.log("METHOD:", method);
        console.log("URL:", url);
        console.log("VALUES:", values);
         const formData = new FormData();

         formData.append("first_name", values.first_name);
         formData.append("last_name", values.last_name);
         formData.append("email", values.email);
         formData.append("phone", values.phone);
         formData.append("department", values.department);
         formData.append("salary", values.salary);

         if (values.image){
          formData.append("image", values.image);
         }

      const response = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

        console.log("STATUS:", response.status);
        console.log("RESPONSE:", data);

      if (!response.ok) {
        throw new Error(data.message || "Failed to create employee");
      }

      console.log(data);

      resetForm();
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      setEditingId(null);
      fetchEmployees();

    } catch (error) {
      console.error("Error:", error);
    }
  };

  const deleteEmployee = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this employee?"
    );

    if (!confirmed) {
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employees/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to delete employee");
      }
      const data = await res.json();
      console.log(data);
      fetchEmployees();

    } catch (error) {
      console.error("Error deleting employee:", error);
    }
  }

  return (
    <div className="py-10 flex justify-center items-center flex-col">
      <h1 className="text-2xl font-bold mb-6">Employee Management</h1>

      <Formik initialValues={
        editingEmployee
          ? {
            first_name: editingEmployee.first_name,
            last_name: editingEmployee.last_name,
            email: editingEmployee.email,
            phone: editingEmployee.phone,
            department: editingEmployee.department,
            salary: editingEmployee.salary,
            image: editingEmployee.image,
          }
          : initialValues
      }
        validationSchema={validationSchema}
        enableReinitialize onSubmit={onSubmit}>
        {({ handleSubmit }) => (
          <Form onSubmit={handleSubmit} >
            <div className="mt-4 flex flex-wrap md:flex-row items-baseline px-6 gap-4 ">
              <div className="flex flex-col gap-2">
                <Field type="text" name="first_name" placeholder="First Name" className="border rounded p-2" />
                <ErrorMessage name="first_name" component="span" className="text-red-500 text-sm" />
              </div>

              <div className="flex flex-col gap-2">
                <Field type="text" name="last_name" placeholder="Last Name" className="border rounded p-2" />
                <ErrorMessage name="last_name" component="span" className="text-red-500 text-sm" />
              </div>

              <div className="flex flex-col gap-2">
                <Field type="email" name="email" placeholder="Email" className="border rounded p-2" />
                <ErrorMessage name="email" component="span" className="text-red-500 text-sm" />
              </div>

              <div className="flex flex-col gap-2">
                <Field type="text" name="phone" placeholder="Phone" className="border rounded p-2" />
                <ErrorMessage name="phone" component="span" className="text-red-500 text-sm" />
              </div>

              <div className="flex flex-col gap-2">
                <Field type="text" name="department" placeholder="Department" className="border rounded p-2" />
                <ErrorMessage name="department" component="span" className="text-red-500 text-sm" />
              </div>

              <div className="flex flex-col gap-2">
                <Field type="text" name="salary" placeholder="Salary" className="border rounded p-2" />
                <ErrorMessage name="salary" component="span" className="text-red-500 text-sm" />
              </div>

              <div className="flex flex-col gap-2">
               
                <Field name="image"  >
                  {({ form }) => (
                    <input type="file" ref={fileInputRef}  className="border rounded p-2 cursor-pointer"  accept="image/*" onChange={(event) => {
                      form.setFieldValue("image" , event.currentTarget.files[0]);}
                  } />
                  )}

                </Field>

              </div>

              <button type="submit" className="bg-blue-500 cursor-pointer text-white px-4 py-2 rounded">
                {editingId ? "Update" : "Add "}
              </button>
            </div>


          </Form>
        )}
      </Formik>
      <div className="mt-10 w-full px-8">
        <h2 className="text-xl font-bold mb-4">Employee List</h2>
        <div className=" my-4 flex items-center justify-center w-full gap-4">
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1) }} placeholder="Search by name" className="border w-full rounded p-2" />
        </div>
        {error && (
          <p className="text-red-500 mt-6">
            {error}
          </p>
        )}
        {loading ? (
          <p className="text-white">Loading employees...</p>
        ) : (
          <table className="min-w-full border border-gray-300">
            <thead>
              <tr>
                <th onClick={() => handleSort("first_name")} className="border px-4 py-2">First Name {getSortIcon("first_name")} </th>
                <th onClick={() => handleSort("last_name")} className="border px-4 py-2">Last Name {getSortIcon("last_name")} </th>
                <th onClick={() => handleSort("email")} className="border px-4 py-2">Email {getSortIcon("email")} </th>
                <th onClick={() => handleSort("phone")} className="border px-4 py-2">Phone {getSortIcon("phone")} </th>
                <th onClick={() => handleSort("department")} className="border px-4 py-2">Department {getSortIcon("department")} </th>
                <th onClick={() => handleSort("salary")} className="border px-4 py-2">Salary {getSortIcon("salary")} </th>
                <th onClick={() => handleSort("images")} className="border px-4 py-2">Image {getSortIcon("images")} </th>
                <th onClick={() => handleSort("Actions")} className="border px-4 py-2">Actions {getSortIcon("Actions")} </th>
              </tr>
            </thead>
            <tbody>
              {employees.map((employee, index) => (
                <>
                  <tr key={employee.id || index}>
                    <td className="border px-4 py-2">{employee.first_name}</td>
                    <td className="border px-4 py-2">{employee.last_name}</td>
                    <td className="border px-4 py-2">{employee.email}</td>
                    <td className="border px-4 py-2">{employee.phone}</td>
                    <td className="border px-4 py-2">{employee.department}</td>
                    <td className="border px-4 py-2">{employee.salary}</td>
                    <td className="border px-4 py-2">
                      {employee.images && (
                        <img src={employee.images} alt="Employee" className="w-16 h-16 object-cover" />
                      )}
                    </td>
                    <td className="border px-4 py-2 flex gap-2 justify-center">
                      <button type="button" className="bg-blue-500 cursor-pointer text-white px-4 py-2 rounded" onClick={() => setEditingId(employee.id)}>Edit</button>
                      <button type="button" className="bg-red-500 cursor-pointer text-white px-4 py-2 rounded" onClick={() => deleteEmployee(employee.id)}>Delete</button>
                    </td>
                  </tr>
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>
      <div className="flex items-center justify-center gap-4 mt-6">
        <button
          onClick={() => setPage(page - 1)}
          disabled={page === 1}
          className="px-4 py-2 bg-gray-500 text-white rounded disabled:opacity-50"> Previous </button>

        <span>
          Page {pagination.page} of {pagination.totalPages}
        </span>

        <button
          onClick={() => setPage(page + 1)}
          disabled={page === pagination.totalPages}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        > Next </button>

      </div>
    </div>
  );
}
