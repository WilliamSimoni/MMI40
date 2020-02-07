package general;

import java.util.HashMap;
import java.util.List;
import java.util.Set;

public class Element {
	
	private String id;
	public HashMap<String,Props> props;
	public List<Style> styleList;
	
	
	public Element(String id ) {
		this.id=id;
		this.props=new HashMap<String,Props>();
		

	}
	
	public String getId() {
		return this.id;
	}

	public boolean editPropId(String id,Object val,String idObj,boolean overWrite) {
		boolean exit=false;
		Set<String> keyset=this.props.keySet();
		Props p=null;
		for(String s:keyset) {
			p=this.props.get(s);
			if(p.getId().equals(id)) {
				exit=true;
				break;
			}
		}
		if(!exit) return false;
		
		return p.addElement(val,idObj);
	}
	
	
    public boolean editPropName(String nameProp,Object val,String idObj,boolean overWrite) {
		Set<String> keyset=this.props.keySet();
		Props p=null;
		for(String s:keyset) {
			if(s.equals(nameProp)) {
				p=this.props.get(s);
				break;
			}
			
		}
		if(p==null) return false;
		else return p.addElement(val,idObj);		

	}
    
    public boolean addStyle(Style styleobj,boolean overWrite) {
    	
    	return styleList.add(styleobj);
    }

}
