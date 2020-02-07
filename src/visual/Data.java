package visual;

import java.util.ArrayList;
import java.util.List;

import general.IdGenerator;
import general.Props;
import general.SubElement;

public class Data extends SubElement {
	
	Props functions;
	Props parameters;

	public Data(String id) {
		super(id);
		
		List<Class<?>> type=new ArrayList<Class<?>>();
		type.add(String.class);
		
		this.functions=new Props(IdGenerator.getNextIdProps(), type, false, false,1);
		this.parameters=new Props(IdGenerator.getNextIdProps(), type, false, false,-1);
		this.props.put("parameters",parameters);
		this.props.put("functions",functions);
	}

}
