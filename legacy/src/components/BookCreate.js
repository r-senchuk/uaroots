import { useState, useContext } from "react";
import TransporterContext from "../context/transporter"

function BookCreate() {
    const {createTransporters} = useContext(TransporterContext);

    const handleSubmit = () =>{
        createTransporters({});
    }

    return <div className="create">BookCreate</div>
}

export default BookCreate;