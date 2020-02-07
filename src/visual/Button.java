package visual;

import java.util.ArrayList;
import java.util.List;

import general.IdGenerator;
import general.Props;
import general.SubElement;

public class Button extends SubElement {
	
	Props url;
	Props child;

	public Button(String id) {
		super(id);
		
		List<Class<?>> type=new ArrayList<Class<?>>();
		type.add(SubElement.class);
		List<Class<?>> type2=new ArrayList<Class<?>>();
		type2.add(String.class);
		
		this.child=new Props(IdGenerator.getNextIdProps(), type, true, true,2);
		this.url=new Props(IdGenerator.getNextIdProps(), type2, false, false,1);
		this.props.put("child",child);
		this.props.put("url",url);
	}

}
