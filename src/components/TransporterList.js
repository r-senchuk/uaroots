import TransporterRow from './TransporterRow'

function TransporterList({images}) {
    let renderedTransporters;
    if(images){
        renderedTransporters = images.map((image)=>{
            return <TransporterRow image={image}></TransporterRow>
        });
    }
     
    return <div>{renderedTransporters}</div>
}

export default TransporterList
