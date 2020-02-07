package visual;

import java.util.ArrayList;
import java.util.List;

import general.IdGenerator;
import general.Props;
import general.SubElement;

public class Container extends SubElement {
	
	Props child;

	public Container(String id1) {
		super(id1);
		
		List<Class<?>> type=new ArrayList<Class<?>>();
		type.add(SubElement.class);
		
		this.child=new Props(IdGenerator.getNextIdProps(), type, true, true,-1);
		this.props.put("child",child);
		
	}

}
