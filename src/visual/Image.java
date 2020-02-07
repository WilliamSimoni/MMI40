package visual;

import java.util.ArrayList;
import java.util.List;

import general.IdGenerator;
import general.Props;
import general.SubElement;

public class Image extends SubElement {
	
	Props src;

	public Image(String id) {
		super(id);
		
		List<Class<?>> type=new ArrayList<Class<?>>();
		type.add(String.class);
		this.src=new Props(IdGenerator.getNextIdProps(), type, false, false,1);
		this.props.put("src",src);
	}

}
