import React,{useRef, useState, useEffect} from 'react';
import './ImageUpload.css';
import Button from './Button';


const ImageUpload = (props) => {
    const filePickerRef = useRef();
    const [file, setFile] = useState();
    const [previewUrl, setPreviewUrl] = useState();
    const [isValid, setValid] = useState(false);

    useEffect (()=>{
        if(!file){
            return;
        }
        
        const fileReader = new FileReader();
        fileReader.onload = (e)=>{
            const { result } = e.target;
            if (result) {
                setPreviewUrl(result)
            }
        };
        fileReader.readAsDataURL(file)
    },[file])
    const pickHandler = event =>{
        let pickedFile;
        let fileisValid = isValid;
        
        if(event.target.files && event.target.files.length === 1){
            console.log(event.target.files[0])
            pickedFile = event.target.files[0];
            setFile(pickedFile);
            setValid(true);
            fileisValid = true
        }
        else{
            setValid(false);
            fileisValid = false
        }
        
        props.onInput(props.id,pickedFile, fileisValid )
    }
    const pickImageHandler = ()=>{
        filePickerRef.current.click();

    }
  return (
    <>
        <div className="form-control">
            <input id={props.id} ref={filePickerRef}
             style={{display:'none'}} type="file" accept=".jpg,.png,.jpeg"
             onChange={pickHandler}
             />
        
        </div>
        <div className={`image-upload ${props.center && 'center'}`}>
            <div className='image-upload__preview'>
                {previewUrl && <img src={previewUrl} alt="Preview"/>}
                {!previewUrl && <p>Please pick an Image</p>}
            </div>

            <Button type="button" onClick={pickImageHandler}>PICK Image</Button>
            {!isValid && <p>{props.errorText}</p>}
            <br/>
            <br/>
            <br/>
        </div>
    </>
  )
}

export default ImageUpload