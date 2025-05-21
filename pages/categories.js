import Layout from "@/components/Layout";
import axios from "axios";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";


export default function Categories(swal) {
    const [editedCategory, setEditedCategory] = useState(null);
    //elements to a category
    const [name, setName] = useState('');
    const [properties, setProperties] = useState([]);
    const [parentCategory, setParentCategory] = useState('');
    //once category created fetch using this state
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        fetchCategories();
       },[])
       
       function fetchCategories() {
           axios.get('/api/categories').then(result => {
               setCategories(result.data);
           })
       }

       async function saveCategory(ev) {
        ev.preventDefault();
        const data = {
            name,
            parentCategory,
            properties:properties.map(p => ({
                name:p.name,
                values:p.values.split(',')
            }))
        };
        //update
        if (editedCategory) {
            data._id = editedCategory._id;
            await axios.put('/api/categories', data);
            setEditedCategory(null);
        } else {
            await axios.post('/api/categories', data)
        }
        setName('');
        setParentCategory('');
        setProperties([]);
        fetchCategories();
       }

       //I think: this populates the form with the current state info (from a specific (category)),
       // then when you hit save/submit the saveCategory function actaully updates the form. 
       function editCategory(category) {
        setEditedCategory(category);
        setName(category.name);
        setParentCategory(category.parent?._id);
        setProperties(
            category.properties.map(({name,values}) => ({
                name,
                values:values.join(',')
            }))
        );
       }

       //delete function here
       function deleteCategory(category) {
        Swal.fire({
            title: `Do you want to delete "${category.name}"?`,
            showCancelButton: true,
            confirmButtonText: "Delete",
            confirmButtonColor: '#d55'
          }).then(async (result) => {
            if (result.isConfirmed) {
                const {_id} = category;
             await axios.delete('/api/categories?_id='+_id);
             fetchCategories();
            Swal.fire(`${category.name} is deleted`, "", "info");  
            } 
          });
    }


       function addProperty() {
        setProperties(prev => {
            return [...prev, {name:'',values:''}]
        })
       }

       function handlePropertyNameChange(index,property,newName) {
        setProperties(prev => {
            const properties = [...prev];
            properties[index].name = newName;
            return properties;
        })
       }

       function handlePropertyValueChange(index,property,newValues){
        setProperties(prev => {
            const properties = [...prev];
            properties[index].values = newValues;
            return properties;
        })
       }

       function removeProperty(indexToRemove){
        setProperties(prev => {
            return [...prev].filter((p,pIndex) => {
                return pIndex !== indexToRemove;
            })
        })
       }

    return (
       <Layout>
          <h1>Categories</h1>
          <label>
            {editedCategory ? `Edit Category ${editedCategory.name}` : `Create new Category`}
          </label>
          <form onSubmit={saveCategory}>
            <div className="flex gap-1">
                <input 
                   type="text"
                   placeholder={'Category Name'}
                   onChange={ev => setName(ev.target.value)}
                   value={name}
                />
                <select
                    onChange={ev => setParentCategory(ev.target.value)}
                    value={parentCategory}
                >
                 <option value="">No Parent Category</option>
                 {categories.length > 0 && categories.map(category => (
                    <option key={category._id} value={category._id}>{category.name}</option>
                 ))}
                </select>
            </div>
            <div className="mb-2">
                <label className="block">Properties</label>
                <button 
                    onClick={addProperty}
                    type="button"
                    className="text-sm mb-2"
                >
                    Add New Property
                </button>
                {properties.length > 0 && properties.map((property,index) => (
                    <div key={property.name} className="flex gap-1 mb-2">
                        <input
                            type="text"
                            placeholder="property name (example: Color)"
                            className="mb-0"
                            value={property.name}
                            onChange={ev => handlePropertyNameChange(index,property,ev.target.value)}
                        />
                        <input
                           type="text"
                           placeholder="Values"
                           className="mb-0"
                           value={property.values}
                            onChange={ev => handlePropertyValueChange(index,property,ev.target.value)}
                        />
                        <button
                          onClick={() => removeProperty(index)}
                          type="button"
                          className="bg-red-200"
                        >
                            Remove
                        </button>
                    </div>
                ))}
            </div>
            <div className="flex gap-1">
                {editedCategory && (
                    <button
                       type="button"
                       onClick={() => {
                        setEditedCategory(null);
                        setName('');
                        setParentCategory('');
                        setProperties([]);
                       }}
                    >
                        Cancel
                    </button>
                )}
                <button type="submit" className="p-1">Save</button>
            </div>
          </form>
          {!editedCategory && (
            <table>
                <thead>
                    <tr>
                        <td>Category Name</td>
                        <td>Parent Category</td>
                        <td></td>
                    </tr>
                </thead>
                <tbody>
                    {categories.length > 0 && categories.map(category => (
                        <tr key={category._id}>
                            <td>{category.name}</td>
                            <td>{category?.parent?.name}</td>
                            <td>
                                <button 
                                  onClick={() => editCategory(category)}
                                  className="mr-1"
                                  >
                                    Edit
                                </button>
                                <button 
                                    onClick={() => deleteCategory(category)}
                                >
                                    Delete
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
          )}
       </Layout>
    )
}

