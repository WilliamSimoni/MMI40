package visual;

import java.util.ArrayList;
import java.util.List;

import general.IdGenerator;
import general.Props;
import general.SubElement;

public class Link extends SubElement {
	
	Props url;

	public Link(String id) {
		super(id);
		
		List<Class<?>> type=new ArrayList<Class<?>>();
		type.add(String.class);
		
		this.url=new Props(IdGenerator.getNextIdProps(), type, false, false,1);
		this.props.put("url",url);
	}

}
