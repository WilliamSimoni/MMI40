package general;

import java.util.ArrayList;
import java.util.List;

public class Props {

	private String id;
	private List<Class<?>> type;//K
	private int cardinality;
	public List<Object> value;//string è l'id dell'elemento
	
	private boolean merge;
	private boolean createFile;
	
	
	public Props(String id,List<Class<?>> type,boolean merge,boolean createFile,int card){
		this.id=id;
		this.type=type;
		this.cardinality=card;
		this.merge=merge;
		this.createFile=createFile;	
		
		this.value=new ArrayList<Object>();
	}
	
	public String getId() {
		return this.id;
	}
	
	public boolean getMerge() {
		return this.merge;
	}
	public boolean getCreateFile() {
		return this.createFile;
	}
	
	public List<Class<?>> getType() {
		return this.type;
	}
	
	public int getCardinality() {
		return this.cardinality;
	}
	
	public boolean addElement(Object id,String idObj) {
		boolean exit=false;
		if(type.size()==1 && type.get(0).equals(SubElement.class)) {
			if(id.getClass().getSuperclass().equals(type.get(0))) exit=true;

		} else {
			for(int i=0;i<type.size();i++) {
				if(id.getClass().equals(type.get(i))) exit=true;


			}
		}
		
		if(exit) {
			if(id.getClass().equals(String.class)) this.value.add(id);
			else {
				this.value.add(idObj);
			}
			
		}
		
		return exit;
		 
	}
	
}
