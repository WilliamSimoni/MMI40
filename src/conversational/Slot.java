package conversational;

import java.util.ArrayList;
import java.util.List;

import general.Element;
import general.IdGenerator;
import general.Props;

public class Slot extends Element {
	
	Props name;
	Props type;
	Props values;

	public Slot(String id) {
		super(id);
		List<Class<?>> type2=new ArrayList<Class<?>>();
		type2.add(String.class);
		this.name=new Props(IdGenerator.getNextIdProps(), type2, true, true, 1);
		this.type=new Props(IdGenerator.getNextIdProps(), type2, true, true, 1);
		this.values=new Props(IdGenerator.getNextIdProps(), type2, true, true, -1);
		this.props.put("name",name);
		this.props.put("type",type);
		this.props.put("values",values);
	}

}
