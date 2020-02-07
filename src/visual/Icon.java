package visual;

import java.util.ArrayList;
import java.util.List;

import general.IdGenerator;
import general.Props;
import general.SubElement;

public class Icon extends SubElement {

	Props name;
	
	public Icon(String id) {
		super(id);
		
		List<Class<?>> type=new ArrayList<Class<?>>();
		type.add(String.class);
		
		this.name=new Props(IdGenerator.getNextIdProps(), type, true, true,1);
		this.props.put("name",name);
	}

}
